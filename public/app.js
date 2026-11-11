import { PLACEMENT, PHASES, WEEKS, dailyTasks, VOCAB, WRITING_PROMPTS, SPEAKING, readingBand, listeningBand, roundBand } from "./content.js";

// ================= Tiện ích =================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD theo giờ máy
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toLocaleDateString("en-CA"); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const wc = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const fmtTime = (s) => `${s < 0 ? "-" : ""}${String(Math.floor(Math.abs(s) / 60)).padStart(2, "0")}:${String(Math.abs(s) % 60).padStart(2, "0")}`;

// Markdown tối giản cho câu trả lời của AI (đã escape trước)
function md(src) {
  const lines = esc(src).split("\n");
  let html = "", list = null;
  const inline = (t) => t.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const l of lines) {
    let m;
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { close(); html += `<h3>${inline(m[1])}</h3>`; }
    else if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (list !== "ul") { close(); html += "<ul>"; list = "ul"; } html += `<li>${inline(m[1])}</li>`; }
    else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== "ol") { close(); html += "<ol>"; list = "ol"; } html += `<li>${inline(m[1])}</li>`; }
    else if (!l.trim()) { close(); }
    else { close(); html += `<p>${inline(l)}</p>`; }
  }
  close();
  return html;
}

// ================= Trạng thái & lưu trữ =================
const DEFAULT = () => ({
  startDate: today(), placement: null, checks: {}, srs: {}, customWords: [],
  writing: [], speaking: [], reading: [], listening: [], mistakes: [], bands: [],
});
let S = DEFAULT();
let AI = false;
let saveTimer;

async function load() {
  try { const r = await fetch("/api/status"); AI = (await r.json()).ai; } catch { AI = false; }
  let remote = null;
  try { remote = await (await fetch("/api/state")).json(); } catch {}
  let local = null;
  try { local = JSON.parse(localStorage.getItem("ielts8") || "null"); } catch {}
  S = { ...DEFAULT(), ...(remote || local || {}) };
  $("#ai-status").textContent = AI ? "Giáo viên AI: đang bật" : "Giáo viên AI: chưa bật";
}
function save() {
  try { localStorage.setItem("ielts8", JSON.stringify(S)); } catch {}
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => fetch("/api/state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(S) }).catch(() => {}), 400);
}
function recordBand(skill, band) { S.bands.push({ date: today(), skill, band }); }
function addMistakes(source, list) {
  for (const m of list || []) S.mistakes.unshift({ ...m, source, date: today(), mastered: false, id: crypto.randomUUID() });
}

async function api(name, body) {
  const r = await fetch(`/api/${name}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Lỗi máy chủ");
  return data;
}
const aiNotice = () => AI ? "" : `<div class="notice">Giáo viên AI chưa bật nên phần chấm tự động/tạo đề không dùng được. Xem <b>README.md</b> để đặt <code>ANTHROPIC_API_KEY</code> rồi khởi động lại máy chủ.</div>`;

// ================= Tính toán lộ trình =================
function planPos() {
  const d = Math.max(0, daysBetween(S.startDate, today()));
  const day = Math.min(d + 1, 84);
  return { day, week: Math.ceil(day / 7), dow: ((day - 1) % 7) + 1 };
}
function latest(skill) { const b = S.bands.filter((x) => x.skill === skill); return b.length ? b[b.length - 1].band : null; }
function estimate() {
  const sk = ["reading", "listening", "writing", "speaking"].map(latest);
  const known = sk.filter((x) => x != null);
  return { sk, overall: known.length === 4 ? roundBand(known.reduce((a, b) => a + b, 0) / 4) : null };
}
function streak() {
  let n = 0, d = today();
  const hasAny = (k) => Object.values(S.checks[k] || {}).some(Boolean);
  if (!hasAny(d)) d = addDays(d, -1);
  while (hasAny(d)) { n++; d = addDays(d, -1); }
  return n;
}

// ================= Router =================
const routes = {};
async function render() {
  const path = location.hash.replace(/^#/, "") || "/";
  const [, name = ""] = path.split("/");
  $$("#nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#/${name}`));
  stopAll();
  const view = $("#view");
  view.innerHTML = "";
  await (routes[name] || routes[""])(view);
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
let cleanups = [];
function onLeave(fn) { cleanups.push(fn); }
function stopAll() { cleanups.forEach((f) => { try { f(); } catch {} }); cleanups = []; speechSynthesis?.cancel(); }

// ================= Trang: Hôm nay =================
routes[""] = (v) => {
  const { day, week, dow } = planPos();
  const tasks = dailyTasks(week, dow);
  const checks = (S.checks[today()] ||= {});
  const est = estimate();
  const due = dueCards().length;
  const doneMin = tasks.filter((t) => checks[t.id]).reduce((a, t) => a + t.min, 0);
  const totalMin = tasks.reduce((a, t) => a + t.min, 0);
  const phase = PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]);
  v.innerHTML = `
    <h1>Ngày ${day}/84 · Tuần ${week}</h1>
    <p class="muted">${esc(phase.name)} — ${esc(phase.goal)}</p>
    ${!S.placement ? `<div class="notice">Bạn chưa làm <a href="#/placement">test đầu vào</a>. Làm trước (~35 phút) để biết khoảng cách tới 8.0.</div>` : ""}
    <div class="grid">
      <div class="stat"><b>${est.overall ?? (S.placement?.band ?? "—")}</b><span>${est.overall ? "Band ước tính hiện tại" : "Band từ test đầu vào"}</span></div>
      <div class="stat"><b>${streak()}</b><span>Ngày học liên tục</span></div>
      <div class="stat"><b>${due}</b><span>Thẻ từ vựng đến hạn</span></div>
      <div class="stat"><b>${S.mistakes.filter((m) => !m.mastered).length}</b><span>Lỗi sai cần ôn</span></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="row"><h2 style="margin:0">Nhiệm vụ hôm nay</h2><span class="spacer"></span><span class="tag">${doneMin}/${totalMin} phút</span></div>
      <p class="muted" style="margin-top:6px">Trọng tâm tuần: ${esc(WEEKS[week - 1].focus)}</p>
      <ul class="tasks">${tasks.map((t) => `
        <li class="${checks[t.id] ? "done" : ""}"><input type="checkbox" data-id="${t.id}" ${checks[t.id] ? "checked" : ""} aria-label="Hoàn thành">
        <span>${esc(t.label)} <small>· ${t.min} phút</small></span><span class="spacer"></span><a class="btn small" href="${t.link}">Mở</a></li>`).join("")}
      </ul>
    </div>
    <div class="card"><h3>Điểm từng kỹ năng (mục tiêu 8.0)</h3>
      <div class="grid">${["Reading", "Listening", "Writing", "Speaking"].map((n, i) => `<div><small>${n}</small><div class="band" style="font-size:1.8rem">${est.sk[i] ?? "—"}</div>${est.sk[i] != null ? `<small>${est.sk[i] >= 8 ? "Đạt mục tiêu" : `Còn thiếu ${(8 - est.sk[i]).toFixed(1)}`}</small>` : `<small>Chưa có dữ liệu</small>`}</div>`).join("")}</div>
    </div>`;
  $$(".tasks input", v).forEach((cb) => cb.addEventListener("change", () => { checks[cb.dataset.id] = cb.checked; save(); render(); }));
};

// ================= Trang: Test đầu vào =================
routes.placement = (v) => {
  const P = PLACEMENT;
  const mcq = [...P.grammar, ...P.vocab];
  v.innerHTML = `
    <h1>Test đầu vào</h1>
    ${S.placement ? `<div class="card"><b>Kết quả lần trước (${esc(S.placement.date)}):</b> band ước tính <b>${S.placement.band}</b>. ${esc(S.placement.summary || "")}</div>` : ""}
    <p class="muted">3 phần: Ngữ pháp & từ vựng (20 câu, ~10 phút) · Reading (6 câu, ~10 phút) · Writing ngắn (20 phút, AI chấm). Không tra từ điển để kết quả chính xác.</p>
    ${aiNotice()}
    <form id="pt">
      <div class="card"><h2 style="margin-top:0">1. Ngữ pháp & từ vựng</h2>
        ${mcq.map((x, i) => `<div class="q"><b>${i + 1}.</b> ${esc(x.q)}<div class="opts">${x.o.map((o, j) => `<label><input type="radio" name="m${i}" value="${j}"> ${esc(o)}</label>`).join("")}</div></div>`).join("")}
      </div>
      <div class="card"><h2 style="margin-top:0">2. Reading — ${esc(P.reading.title)}</h2>
        <div class="passage">${esc(P.reading.passage)}</div>
        ${P.reading.questions.map((x, i) => `<div class="q"><b>${i + 1}.</b> ${esc(x.q)}<div class="opts">${x.o.map((o, j) => `<label><input type="radio" name="r${i}" value="${j}"> ${esc(o)}</label>`).join("")}</div></div>`).join("")}
      </div>
      <div class="card"><h2 style="margin-top:0">3. Writing</h2><p>${esc(P.writingPrompt)}</p>
        <textarea id="pt-essay" placeholder="Viết bài của bạn ở đây…"></textarea>
        <div class="row" style="margin-top:6px"><small id="pt-wc">0 từ</small></div>
      </div>
      <div class="row"><button class="primary" type="submit">Nộp bài & xem kết quả</button><span id="pt-msg" class="loading"></span></div>
    </form>
    <div id="pt-result"></div>`;
  const ta = $("#pt-essay", v);
  ta.addEventListener("input", () => ($("#pt-wc", v).textContent = `${wc(ta.value)} từ`));
  $("#pt", v).addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = (n) => { const c = $(`input[name="${n}"]:checked`, v); return c ? Number(c.value) : -1; };
    let gv = 0; mcq.forEach((x, i) => { const a = val("m" + i); if (a === x.a) gv++; $$(`input[name="m${i}"]`, v).forEach((r) => r.parentElement.classList.toggle("right", Number(r.value) === x.a)); if (a >= 0 && a !== x.a) $(`input[name="m${i}"][value="${a}"]`, v).parentElement.classList.add("wrong"); });
    let rd = 0; P.reading.questions.forEach((x, i) => { const a = val("r" + i); if (a === x.a) rd++; $$(`input[name="r${i}"]`, v).forEach((r) => r.parentElement.classList.toggle("right", Number(r.value) === x.a)); if (a >= 0 && a !== x.a) $(`input[name="r${i}"][value="${a}"]`, v).parentElement.classList.add("wrong"); });
    const gvBand = roundBand(Math.min(9, 4 + gv * 0.25));
    const rdBand = readingBand(rd, P.reading.questions.length);
    let wr = null;
    if (AI && wc(ta.value) >= 60) {
      $("#pt-msg", v).textContent = "Giáo viên AI đang chấm Writing… (khoảng 30–60 giây)";
      try { wr = await api("grade-writing", { task: "task2", prompt: P.writingPrompt, essay: ta.value, minutes: 20 }); }
      catch (err) { $("#pt-msg", v).textContent = "Không chấm được Writing: " + err.message; }
    }
    $("#pt-msg", v).textContent = "";
    const parts = [gvBand, rdBand, ...(wr ? [wr.overall_band] : [])];
    const band = roundBand(parts.reduce((a, b) => a + b, 0) / parts.length);
    const gap = Math.max(0, 8 - band);
    const summary = gap <= 0.5 ? "Bạn đã gần 8.0 — tập trung luyện đề và tinh chỉnh Writing/Speaking." : gap <= 1.5 ? "Khoảng cách vừa phải — lộ trình 12 tuần phù hợp, cần đều đặn 2.5h/ngày." : "Khoảng cách lớn (>1.5 band) — 3 tháng là rất tham vọng; ưu tiên ngữ pháp nền và từ vựng ở giai đoạn 1, cân nhắc mục tiêu trung gian 7.0.";
    S.placement = { date: today(), band, gv, rd, writing: wr?.overall_band ?? null, summary };
    recordBand("reading", rdBand);
    if (wr) { recordBand("writing", wr.overall_band); addMistakes("Test đầu vào", wr.mistakes); }
    save();
    $("#pt-result", v).innerHTML = `<div class="card"><h2 style="margin-top:0">Kết quả</h2>
      <div class="row"><div class="band">${band}</div><div><b>Band ước tính</b><br><small>Mục tiêu 8.0 · còn thiếu ${gap.toFixed(1)}</small></div></div>
      <ul><li>Ngữ pháp & từ vựng: ${gv}/20 (≈ ${gvBand})</li><li>Reading: ${rd}/6 (≈ ${rdBand})</li><li>Writing: ${wr ? wr.overall_band : "chưa chấm (cần AI và ≥ 60 từ)"}</li></ul>
      <p>${esc(summary)}</p>${wr ? writingResultHTML(wr) : ""}
      <a class="btn primary" href="#/">Bắt đầu lộ trình</a></div>`;
    $("#pt-result", v).scrollIntoView({ behavior: "smooth" });
  });
};

// ================= Trang: Lộ trình =================
routes.plan = (v) => {
  const { week } = planPos();
  v.innerHTML = `<h1>Lộ trình 12 tuần → 8.0</h1>
    <p class="muted">Bắt đầu: ${esc(S.startDate)} · ~2.5 giờ/ngày, 6 ngày học + 1 ngày ôn & thi thử.</p>
    <div class="card"><div class="row"><label style="margin:0">Ngày bắt đầu</label><input type="date" id="sd" value="${esc(S.startDate)}" style="width:auto"><button id="sd-save" class="small">Lưu</button></div></div>
    ${PHASES.map((p) => `<div class="card"><h2 style="margin-top:0">${esc(p.name)}</h2><p class="muted">${esc(p.goal)}</p>
      ${WEEKS.filter((w) => w.w >= p.weeks[0] && w.w <= p.weeks[1]).map((w) => `<div class="week ${w.w === week ? "now" : ""}"><b>Tuần ${w.w}</b><div>${esc(w.focus)}</div></div>`).join("")}</div>`).join("")}
    <div class="card"><h3>Khung một ngày học</h3><ul>${dailyTasks(1, 1).map((t) => `<li>${esc(t.label)} — ${t.min} phút</li>`).join("")}</ul>
    <p class="muted">Nguyên tắc band 8: mỗi bài Writing/Speaking đều được AI chấm → lỗi tự vào <a href="#/mistakes">Sổ lỗi sai</a> → ôn lại vào ngày 7. Từ tuần 8, mỗi tuần 1 full test.</p></div>`;
  $("#sd-save", v).onclick = () => { S.startDate = $("#sd", v).value || today(); save(); render(); };
};

// ================= Trang: Từ vựng SRS (SM-2) =================
function allWords() { return [...VOCAB, ...S.customWords]; }
function dueCards() { const t = today(); return allWords().filter((w) => S.srs[w.id] && S.srs[w.id].due <= t); }
function newCards() { return allWords().filter((w) => !S.srs[w.id]); }
function grade(w, q) { // q: 0 quên, 3 khó, 4 nhớ, 5 dễ
  const c = S.srs[w.id] || { ef: 2.5, reps: 0, interval: 0 };
  if (q < 3) { c.reps = 0; c.interval = 1; }
  else { c.reps++; c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.round(c.interval * c.ef); if (q === 5) c.interval = Math.round(c.interval * 1.3); }
  c.ef = Math.max(1.3, c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  c.due = addDays(today(), c.interval);
  S.srs[w.id] = c;
  save();
}
routes.vocab = (v) => {
  let mode = "flash", keyHandler = null;
  const unbind = () => { if (keyHandler) document.removeEventListener("keydown", keyHandler); keyHandler = null; };
  onLeave(unbind);
  const draw = () => {
    unbind();
    const due = dueCards(), fresh = newCards();
    const learned = Object.keys(S.srs).length;
    v.innerHTML = `<h1>Từ vựng học thuật (SRS)</h1>
      <p class="muted">Lặp lại ngắt quãng: thẻ nhớ tốt sẽ quay lại sau vài ngày, thẻ quên quay lại ngày mai. Mục tiêu: ôn hết thẻ đến hạn + 15 từ mới/ngày.</p>
      <div class="grid"><div class="stat"><b>${due.length}</b><span>Đến hạn hôm nay</span></div><div class="stat"><b>${learned}</b><span>Đã học / ${allWords().length}</span></div><div class="stat"><b>${fresh.length}</b><span>Từ mới còn lại</span></div></div>
      <div class="tabs" style="margin-top:16px"><button data-m="flash" class="${mode === "flash" ? "on" : ""}">Thẻ ghi nhớ</button><button data-m="type" class="${mode === "type" ? "on" : ""}">Gõ từ (nhớ chủ động)</button><button data-m="list" class="${mode === "list" ? "on" : ""}">Danh sách & thêm từ</button></div>
      <div id="vz"></div>`;
    $$(".tabs button", v).forEach((b) => (b.onclick = () => { mode = b.dataset.m; draw(); }));
    const z = $("#vz", v);
    const queue = [...due, ...fresh.slice(0, Math.max(0, 15 - todayNewCount()))];
    if (mode === "list") return listMode(z);
    if (!queue.length) { z.innerHTML = `<div class="card">Xong hết thẻ hôm nay. Quay lại ngày mai, hoặc thêm từ của riêng bạn ở tab Danh sách.</div>`; return; }
    const w = queue[0];
    const isNew = !S.srs[w.id];
    if (mode === "flash") {
      z.innerHTML = `<div class="card flash"><span class="tag ${isNew ? "warn" : ""}">${isNew ? "Từ mới" : "Ôn tập"} · còn ${queue.length}</span>
        <div class="word">${esc(w.word)} <small>(${esc(w.pos)})</small></div><button id="say" class="small" style="align-self:center">🔊 Nghe</button>
        <div id="back" hidden><p><b>${esc(w.vi)}</b></p><p class="ex">${esc(w.ex)}</p><p><small>Collocation: ${esc(w.col)}</small></p></div>
        <div class="row" style="justify-content:center" id="acts"><button class="primary" id="show">Lật thẻ (Space)</button></div></div>`;
      $("#say", z).onclick = () => speak(w.word + ". " + w.ex);
      const show = () => { $("#back", z).hidden = false; $("#acts", z).innerHTML = [["Quên", 0], ["Khó", 3], ["Nhớ", 4], ["Dễ", 5]].map(([l, q], i) => `<button data-q="${q}">${i + 1} · ${l}</button>`).join(""); $$("#acts button", z).forEach((b) => (b.onclick = () => next(Number(b.dataset.q)))); };
      const next = (q) => { if (isNew) bumpNew(); grade(w, q); draw(); };
      $("#show", z).onclick = show;
      keyHandler = (e) => { if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return; if (e.code === "Space") { e.preventDefault(); if ($("#show", z)) show(); } const n = { Digit1: 0, Digit2: 3, Digit3: 4, Digit4: 5 }[e.code]; if (n != null && $("#back", z) && !$("#back", z).hidden) next(n); };
      document.addEventListener("keydown", keyHandler);
    } else {
      z.innerHTML = `<div class="card"><span class="tag">${isNew ? "Từ mới" : "Ôn tập"} · còn ${queue.length}</span>
        <p style="margin-top:10px"><b>${esc(w.vi)}</b> <small>(${esc(w.pos)})</small></p>
        <p class="ex muted">${esc(w.ex.replace(new RegExp(w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), "_____"))}</p>
        <div class="row"><input id="ans" placeholder="Gõ từ tiếng Anh…" autocomplete="off" style="flex:1"><button class="primary" id="chk">Kiểm tra</button></div><div id="fb" style="margin-top:10px"></div></div>`;
      const ans = $("#ans", z); ans.focus();
      const check = () => {
        const ok = ans.value.trim().toLowerCase() === w.word.toLowerCase();
        $("#fb", z).innerHTML = `${ok ? `<span class="tag ok">Chính xác</span>` : `<span class="tag bad">Đáp án: ${esc(w.word)}</span>`} <button class="small" id="nx">Tiếp</button>`;
        if (isNew) bumpNew(); grade(w, ok ? 4 : 0); speak(w.word);
        $("#nx", z).onclick = draw; $("#nx", z).focus();
      };
      $("#chk", z).onclick = check; ans.onkeydown = (e) => e.key === "Enter" && check();
    }
  };
  const listMode = (z) => {
    z.innerHTML = `<div class="card"><h3>Thêm từ của bạn</h3>
      <div class="grid"><div><label>Từ</label><input id="nw"></div><div><label>Nghĩa</label><input id="nv"></div><div><label>Ví dụ</label><input id="ne"></div><div><label>Collocation</label><input id="nc"></div></div>
      <button class="primary" id="add" style="margin-top:10px">Thêm vào bộ thẻ</button></div>
      <div class="card"><table style="width:100%;border-collapse:collapse">${allWords().map((w) => `<tr style="border-bottom:1px solid var(--line)"><td style="padding:6px 4px"><b>${esc(w.word)}</b> <small>${esc(w.pos)}</small></td><td>${esc(w.vi)}</td><td><small>${S.srs[w.id] ? "ôn " + esc(S.srs[w.id].due) : "chưa học"}</small></td></tr>`).join("")}</table></div>`;
    $("#add", z).onclick = () => {
      const word = $("#nw", z).value.trim(); if (!word) return;
      S.customWords.push({ id: "c" + Date.now(), word, pos: "", vi: $("#nv", z).value.trim(), ex: $("#ne", z).value.trim(), col: $("#nc", z).value.trim() || "—" });
      save(); draw();
    };
  };
  draw();
};
function todayNewCount() { return (S.newCount?.date === today() ? S.newCount.n : 0); }
function bumpNew() { S.newCount = { date: today(), n: todayNewCount() + 1 }; }

// ================= Phát âm (Web Speech) =================
function voice(prefer = "en-GB", idx = 0) {
  const vs = speechSynthesis.getVoices().filter((x) => x.lang.startsWith("en"));
  const pref = vs.filter((x) => x.lang === prefer);
  const pool = pref.length ? pref : vs;
  return pool[idx % Math.max(1, pool.length)] || null;
}
function speak(text, opts = {}) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB"; u.rate = opts.rate || 0.95; const vv = voice("en-GB", opts.voice || 0); if (vv) u.voice = vv;
  if (opts.onend) u.onend = opts.onend;
  speechSynthesis.speak(u);
}

// ================= Trang: Reading =================
routes.reading = (v) => {
  v.innerHTML = `<h1>Reading</h1><p class="muted">AI soạn một passage gốc kiểu IELTS Academic + 10 câu hỏi. Làm trong 20 phút, sau đó xem đáp án và giải thích.</p>${aiNotice()}
    <div class="card row"><input id="topic" placeholder="Chủ đề (tuỳ chọn): ví dụ marine biology, urban planning…" style="flex:1"><select id="lvl" style="width:auto"><option value="6.5">Độ khó 6.5</option><option value="7.5" selected>Độ khó 7.5</option><option value="8.5">Độ khó 8.5</option></select><button class="primary" id="gen" ${AI ? "" : "disabled"}>Tạo bài</button></div>
    <div id="rz"></div>${historyHTML(S.reading, "Reading")}`;
  $("#gen", v).onclick = async () => {
    const z = $("#rz", v); z.innerHTML = `<p class="loading">Đang soạn bài đọc… (30–90 giây)</p>`;
    try {
      const t = await api("gen-reading", { topic: $("#topic", v).value, level: $("#lvl", v).value });
      runTest(z, t, "reading", 20 * 60);
    } catch (e) { z.innerHTML = `<div class="notice">${esc(e.message)}</div>`; }
  };
};
function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim(); }
function runTest(z, t, kind, seconds) {
  const left = kind === "reading"
    ? `<div class="card"><h2 style="margin-top:0">${esc(t.title)}</h2><div class="passage">${esc(t.passage)}</div></div>`
    : `<div class="card"><h2 style="margin-top:0">${esc(t.title)}</h2><p>${esc(t.context)}</p>
       <div class="row"><button class="primary" id="play">▶ Nghe (chỉ 1 lần như thi thật)</button><button id="replay" class="small">Nghe lại (luyện tập)</button><select id="rate" style="width:auto"><option value="0.9">Chậm</option><option value="1" selected>Thường</option><option value="1.1">Nhanh</option></select></div>
       <p class="muted" id="ls">Dùng giọng đọc của trình duyệt. Nên dùng tai nghe.</p><div id="script" hidden class="passage"></div></div>`;
  z.innerHTML = `<div class="row" style="margin-bottom:10px"><span class="timer" id="tm">${fmtTime(seconds)}</span><span class="muted">thời gian khuyến nghị</span></div>
    <div class="split">${left}<div class="card"><form id="qf">${t.questions.map((q, i) => `<div class="q"><b>${i + 1}.</b> ${esc(q.question)}
      ${q.options?.length ? `<div class="opts">${q.options.map((o) => `<label><input type="radio" name="q${i}" value="${esc(o)}"> ${esc(o)}</label>`).join("")}</div>` : `<input name="q${i}" autocomplete="off" style="margin-top:6px">`}
      <div class="exp" hidden></div></div>`).join("")}<button class="primary" type="submit" style="margin-top:12px">Nộp bài</button></form></div></div><div id="res"></div>`;
  // đồng hồ
  let s = seconds; const tm = $("#tm", z);
  const iv = setInterval(() => { s--; tm.textContent = fmtTime(s); tm.classList.toggle("late", s < 0); }, 1000);
  onLeave(() => clearInterval(iv));
  if (kind === "listening") {
    let played = false;
    const play = () => playScript(t.script, Number($("#rate", z).value), $("#ls", z));
    $("#play", z).onclick = () => { if (played) return; played = true; $("#play", z).disabled = true; play(); };
    $("#replay", z).onclick = () => { speechSynthesis.cancel(); play(); };
  }
  $("#qf", z).addEventListener("submit", (e) => {
    e.preventDefault(); clearInterval(iv); speechSynthesis.cancel();
    let correct = 0;
    t.questions.forEach((q, i) => {
      const box = $$(".q", z)[i];
      const r = $(`input[name="q${i}"]:checked`, z), txt = $(`input[name="q${i}"]:not([type=radio])`, z);
      const ans = r ? r.value : txt ? txt.value : "";
      const a = norm(ans), k = norm(q.answer);
      // Chấp nhận đáp án dạng chữ cái ("B") khớp với lựa chọn "B. ..."
      const ok = !!a && (a === k || (q.options?.length > 0 && k.length === 1 && a.split(" ")[0] === k));
      if (ok) correct++;
      const exp = $(".exp", box); exp.hidden = false;
      exp.innerHTML = `<p style="margin-top:6px">${ok ? `<span class="tag ok">Đúng</span>` : `<span class="tag bad">Sai — đáp án: ${esc(q.answer)}</span>`} <small>${esc(q.explanation)}</small></p>`;
    });
    const band = kind === "reading" ? readingBand(correct, t.questions.length) : listeningBand(correct, t.questions.length);
    S[kind].push({ date: today(), title: t.title, correct, total: t.questions.length, band });
    recordBand(kind, band); save();
    if (kind === "listening") { $("#script", z).hidden = false; $("#script", z).textContent = t.script; }
    $("#res", z).innerHTML = `<div class="card"><div class="row"><div class="band">${band}</div><div><b>${correct}/${t.questions.length} câu đúng</b><br><small>Quy đổi xấp xỉ theo thang 40 câu. Để chắc chắn đạt 8.0 cần ~${kind === "reading" ? "35" : "35"}/40.</small></div></div>
      <p class="muted">Bước tiếp: với mỗi câu sai, tìm câu chứa đáp án trong ${kind === "reading" ? "bài đọc" : "script"} và ghi lại vì sao bạn bị đánh lừa (paraphrase, NOT GIVEN vs FALSE, bẫy đính chính…).</p></div>`;
    $("#res", z).scrollIntoView({ behavior: "smooth" });
  });
}
function playScript(script, rate, status) {
  speechSynthesis.cancel();
  const parts = script.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const speakers = {};
  parts.forEach((line) => {
    const m = line.match(/^([A-Z][A-Z ]{1,20}):\s*(.*)/);
    const who = m ? m[1] : "_";
    if (!(who in speakers)) speakers[who] = Object.keys(speakers).length;
    const u = new SpeechSynthesisUtterance(m ? m[2] : line);
    u.lang = "en-GB"; u.rate = rate;
    const vv = voice(speakers[who] % 2 ? "en-US" : "en-GB", speakers[who]); if (vv) u.voice = vv;
    speechSynthesis.speak(u);
  });
  const last = new SpeechSynthesisUtterance(""); last.onend = () => status && (status.textContent = "Đã nghe xong. Hoàn thành câu trả lời rồi nộp bài.");
  speechSynthesis.speak(last);
  if (status) status.textContent = "Đang phát…";
}

// ================= Trang: Listening =================
routes.listening = (v) => {
  v.innerHTML = `<h1>Listening</h1><p class="muted">AI soạn script gốc theo đúng format Section 1–4, trình duyệt đọc to bằng 2 giọng. Nghe 1 lần, điền đáp án, sau đó xem script để chép chính tả đoạn sai.</p>${aiNotice()}
    ${"speechSynthesis" in window ? "" : `<div class="notice">Trình duyệt này không hỗ trợ đọc văn bản — hãy dùng Chrome hoặc Edge.</div>`}
    <div class="card row"><select id="sec" style="width:auto"><option value="1">Section 1 — hội thoại đời sống</option><option value="2">Section 2 — độc thoại đời sống</option><option value="3">Section 3 — thảo luận học thuật</option><option value="4" selected>Section 4 — bài giảng học thuật</option></select><input id="topic" placeholder="Chủ đề (tuỳ chọn)" style="flex:1"><button class="primary" id="gen" ${AI ? "" : "disabled"}>Tạo bài nghe</button></div>
    <div id="lz"></div>${historyHTML(S.listening, "Listening")}`;
  $("#gen", v).onclick = async () => {
    const z = $("#lz", v); z.innerHTML = `<p class="loading">Đang soạn bài nghe… (30–90 giây)</p>`;
    try { const t = await api("gen-listening", { section: $("#sec", v).value, topic: $("#topic", v).value }); runTest(z, t, "listening", 10 * 60); }
    catch (e) { z.innerHTML = `<div class="notice">${esc(e.message)}</div>`; }
  };
};
function historyHTML(list, name) {
  if (!list.length) return "";
  return `<div class="card"><h3>Lịch sử ${name}</h3><table style="width:100%;border-collapse:collapse">${list.slice(-10).reverse().map((x) => `<tr style="border-bottom:1px solid var(--line)"><td style="padding:6px 4px">${esc(x.date)}</td><td>${esc(x.title || x.prompt?.slice(0, 60) || "")}</td><td>${x.correct != null ? `${x.correct}/${x.total}` : ""}</td><td><b>${x.band ?? ""}</b></td></tr>`).join("")}</table></div>`;
}

// ================= Trang: Writing =================
function criteriaHTML(c, names) {
  return `<div class="crit">${Object.entries(c).map(([k, x]) => `<div class="c"><b>${names[k] || k}: ${x.band}</b><br>${esc(x.comment)}</div>`).join("")}</div>`;
}
function mistakesHTML(list) {
  if (!list?.length) return "";
  return `<h3 style="margin-top:16px">Lỗi cần sửa</h3>${list.map((m) => `<div class="mistake"><span class="tag">${esc(m.category)}</span> <del>${esc(m.original)}</del> → <ins>${esc(m.correction)}</ins><br><small>${esc(m.explanation)}</small></div>`).join("")}`;
}
function writingResultHTML(r) {
  return `<div class="card"><div class="row"><div class="band">${r.overall_band}</div><b>Band Writing</b></div>
    ${criteriaHTML(r.criteria, { task: "Task Response/Achievement", coherence_cohesion: "Coherence & Cohesion", lexical_resource: "Lexical Resource", grammar: "Grammatical Range & Accuracy" })}
    <h3 style="margin-top:16px">Điểm mạnh</h3><ul>${r.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    <h3>3 ưu tiên để lên band</h3><ol>${r.priorities.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    ${mistakesHTML(r.mistakes)}
    <details style="margin-top:14px"><summary><b>Bản viết lại band 8+</b></summary><div class="passage" style="margin-top:10px">${esc(r.band8_version)}</div></details></div>`;
}
routes.writing = (v) => {
  let task = "task2", prompt = pick(WRITING_PROMPTS.task2);
  const draw = () => {
    const mins = task === "task1" ? 20 : 40, minWords = task === "task1" ? 150 : 250;
    const draftKey = "draft-" + task;
    let draft = ""; try { draft = localStorage.getItem(draftKey) || ""; } catch {}
    v.innerHTML = `<h1>Writing</h1>${aiNotice()}
      <div class="tabs"><button data-t="task2" class="${task === "task2" ? "on" : ""}">Task 2 (40 phút, ≥250 từ)</button><button data-t="task1" class="${task === "task1" ? "on" : ""}">Task 1 (20 phút, ≥150 từ)</button></div>
      <div class="card"><div class="row"><b>Đề bài</b><span class="spacer"></span><button class="small" id="new">Đề khác</button><button class="small" id="own">Tự nhập đề</button></div><p id="pr" style="margin-top:8px">${esc(prompt)}</p></div>
      <div class="card"><div class="row"><span class="timer" id="tm">${fmtTime(mins * 60)}</span><button class="small" id="start">Bắt đầu tính giờ</button><span class="spacer"></span><small id="wcount">0 từ</small></div>
        <textarea id="essay" style="margin-top:10px" placeholder="Viết bài ở đây. Bản nháp tự lưu.">${esc(draft)}</textarea>
        <div class="row" style="margin-top:10px"><button class="primary" id="grade" ${AI ? "" : "disabled"}>Nộp cho giám khảo AI chấm</button><span id="msg" class="loading"></span></div></div>
      <div id="wr"></div>
      <div class="card"><h3>Tự kiểm tra trước khi nộp (checklist band 8)</h3><ul>
        <li>Trả lời <b>đủ mọi phần</b> của đề; quan điểm rõ ràng xuyên suốt (Task 2) / có overview (Task 1).</li>
        <li>Mỗi đoạn một ý chính, có ví dụ/giải thích cụ thể; liên kết tự nhiên, không lạm dụng "Moreover, Furthermore".</li>
        <li>Từ vựng chính xác, có collocation; paraphrase đề, không lặp từ khoá.</li>
        <li>Đa số câu không lỗi; trộn câu phức, mệnh đề quan hệ, bị động, điều kiện.</li></ul></div>
      ${historyHTML(S.writing, "Writing")}`;
    const ta = $("#essay", v), wcEl = $("#wcount", v);
    const upd = () => { const n = wc(ta.value); wcEl.textContent = `${n} từ`; wcEl.style.color = n < minWords ? "var(--warn)" : "var(--ok)"; try { localStorage.setItem(draftKey, ta.value); } catch {} };
    ta.addEventListener("input", upd); upd();
    $$(".tabs button", v).forEach((b) => (b.onclick = () => { task = b.dataset.t; prompt = pick(WRITING_PROMPTS[task]); draw(); }));
    $("#new", v).onclick = () => { prompt = pick(WRITING_PROMPTS[task].filter((p) => p !== prompt)); $("#pr", v).textContent = prompt; };
    $("#own", v).onclick = () => { const p = window.prompt("Dán đề bài của bạn:"); if (p) { prompt = p; $("#pr", v).textContent = p; } };
    let s = mins * 60, iv, started = null;
    $("#start", v).onclick = () => { if (iv) return; started = Date.now(); iv = setInterval(() => { s--; $("#tm", v).textContent = fmtTime(s); $("#tm", v).classList.toggle("late", s < 0); }, 1000); };
    onLeave(() => clearInterval(iv));
    $("#grade", v).onclick = async () => {
      if (wc(ta.value) < 50) return ($("#msg", v).textContent = "Bài quá ngắn để chấm.");
      clearInterval(iv); $("#grade", v).disabled = true; $("#msg", v).textContent = "Giám khảo AI đang chấm… (30–90 giây)";
      try {
        const minutes = started ? Math.round((Date.now() - started) / 60000) : null;
        const r = await api("grade-writing", { task, prompt, essay: ta.value, minutes });
        S.writing.push({ date: today(), task, prompt, essay: ta.value, band: r.overall_band, result: r });
        recordBand("writing", r.overall_band); addMistakes("Writing " + task, r.mistakes); save();
        try { localStorage.removeItem(draftKey); } catch {}
        $("#msg", v).textContent = `Đã lưu ${r.mistakes.length} lỗi vào Sổ lỗi sai.`;
        $("#wr", v).innerHTML = writingResultHTML(r); $("#wr", v).scrollIntoView({ behavior: "smooth" });
      } catch (e) { $("#msg", v).textContent = e.message; }
      $("#grade", v).disabled = false;
    };
  };
  draw();
};

// ================= Trang: Speaking =================
routes.speaking = (v) => {
  let part = "Part 1";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const draw = () => {
    const q = part === "Part 2" ? pick(SPEAKING.part2) : pick(part === "Part 1" ? SPEAKING.part1 : SPEAKING.part3);
    const qText = typeof q === "string" ? q : `${q.cue}\nYou should say: ${q.points.join("; ")}`;
    const prep = part === "Part 2" ? 60 : 0, talk = part === "Part 1" ? 30 : part === "Part 2" ? 120 : 60;
    v.innerHTML = `<h1>Speaking</h1>${aiNotice()}
      <p class="muted">Bấm ghi âm và nói như trong phòng thi. Trình duyệt tự chép lời (Chrome/Edge) — bạn có thể sửa lại bản ghi trước khi nộp. AI chấm 3 tiêu chí; phát âm hãy tự nghe lại bản ghi âm. Muốn thi thử hội thoại liên tục: dùng <a href="#/tutor">Giám khảo AI</a>.</p>
      <div class="tabs">${["Part 1", "Part 2", "Part 3"].map((p) => `<button data-p="${p}" class="${p === part ? "on" : ""}">${p}</button>`).join("")}</div>
      <div class="card"><div class="row"><b>${part}</b><span class="spacer"></span><button class="small" id="new">Câu khác</button><button class="small" id="say">🔊 Nghe câu hỏi</button></div>
        ${typeof q === "string" ? `<p style="margin-top:8px;font-size:1.1rem">${esc(q)}</p>` : `<p style="margin-top:8px;font-size:1.1rem"><b>${esc(q.cue)}</b></p><p>You should say:</p><ul>${q.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`}
        <div class="row"><span class="timer" id="tm">${fmtTime(prep || talk)}</span><span class="muted" id="phase">${prep ? "Chuẩn bị 1 phút (ghi chú ý chính)" : `Nói khoảng ${talk} giây`}</span></div>
        <div class="row" style="margin-top:10px"><button class="primary" id="rec">● Bắt đầu${prep ? " (chuẩn bị → nói)" : " ghi âm"}</button><button id="stop" disabled>■ Dừng</button><audio id="aud" controls hidden></audio></div>
        ${SR ? "" : `<p class="muted" style="margin-top:8px">Trình duyệt này không tự chép lời được — hãy gõ lại ý bạn đã nói vào ô dưới.</p>`}
        <label style="margin-top:12px">Bản ghi lời nói (sửa được)</label><textarea id="tr" style="min-height:140px"></textarea>
        <div class="row" style="margin-top:10px"><button class="primary" id="grade" ${AI ? "" : "disabled"}>AI chấm câu trả lời</button><span id="msg" class="loading"></span></div></div>
      <div id="sr"></div>
      <div class="card"><h3>Mẹo band 8</h3><ul><li>Part 1: trả lời 2–3 câu — ý chính + lý do + ví dụ ngắn.</li><li>Part 2: đi đủ 4 gợi ý, kể có chi tiết cảm xúc, nói tới khi giám khảo dừng.</li><li>Part 3: đưa quan điểm → giải thích → ví dụ → mặt trái/ngoại lệ. Dùng hedging: <i>"It largely depends on…", "I'd argue that…"</i>.</li></ul></div>`;
    $$(".tabs button", v).forEach((b) => (b.onclick = () => { part = b.dataset.p; draw(); }));
    $("#new", v).onclick = draw;
    $("#say", v).onclick = () => speak(typeof q === "string" ? q : q.cue);
    let mr, chunks = [], rec, iv, stream;
    const tm = $("#tm", v);
    const stop = () => {
      clearInterval(iv); try { rec?.stop(); } catch {} try { mr?.state === "recording" && mr.stop(); } catch {}
      stream?.getTracks().forEach((t) => t.stop()); $("#stop", v).disabled = true; $("#rec", v).disabled = false; $("#phase", v).textContent = "Đã dừng. Nghe lại bản ghi âm và kiểm tra bản chép lời.";
    };
    onLeave(stop);
    const startTalk = async () => {
      $("#phase", v).textContent = "Đang ghi âm — hãy nói!";
      let s = talk; tm.textContent = fmtTime(s);
      iv = setInterval(() => { s--; tm.textContent = fmtTime(s); tm.classList.toggle("late", s < 0); }, 1000);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mr = new MediaRecorder(stream); chunks = [];
        mr.ondataavailable = (e) => chunks.push(e.data);
        mr.onstop = () => { const a = $("#aud", v); if (!a) return; a.src = URL.createObjectURL(new Blob(chunks, { type: mr.mimeType })); a.hidden = false; };
        mr.start();
      } catch { $("#phase", v).textContent = "Không truy cập được micro — bạn vẫn có thể gõ câu trả lời."; }
      if (SR) {
        rec = new SR(); rec.lang = "en-GB"; rec.continuous = true; rec.interimResults = true;
        const base = $("#tr", v).value;
        rec.onresult = (e) => { let t = ""; for (const r of e.results) t += r[0].transcript + " "; $("#tr", v).value = (base + " " + t).trim(); };
        try { rec.start(); } catch {}
      }
    };
    $("#rec", v).onclick = () => {
      $("#rec", v).disabled = true; $("#stop", v).disabled = false;
      if (prep) {
        let s = prep; $("#phase", v).textContent = "Chuẩn bị…";
        iv = setInterval(() => { s--; tm.textContent = fmtTime(s); if (s <= 0) { clearInterval(iv); startTalk(); } }, 1000);
      } else startTalk();
    };
    $("#stop", v).onclick = stop;
    $("#grade", v).onclick = async () => {
      const tr = $("#tr", v).value.trim();
      if (wc(tr) < 8) return ($("#msg", v).textContent = "Câu trả lời quá ngắn.");
      stop(); $("#grade", v).disabled = true; $("#msg", v).textContent = "Giám khảo AI đang chấm…";
      try {
        const r = await api("grade-speaking", { part, question: qText, transcript: tr });
        S.speaking.push({ date: today(), part, prompt: qText, transcript: tr, band: r.overall_band, result: r });
        recordBand("speaking", r.overall_band); addMistakes("Speaking " + part, r.mistakes); save();
        $("#msg", v).textContent = "";
        $("#sr", v).innerHTML = `<div class="card"><div class="row"><div class="band">${r.overall_band}</div><div><b>Band Speaking (không tính phát âm)</b></div></div>
          ${criteriaHTML(r.criteria, { fluency_coherence: "Fluency & Coherence", lexical_resource: "Lexical Resource", grammar: "Grammatical Range & Accuracy" })}
          <h3 style="margin-top:16px">Ưu tiên</h3><ol>${r.priorities.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          ${mistakesHTML(r.mistakes)}
          <h3 style="margin-top:16px">Câu trả lời mẫu band 8</h3><p class="passage">${esc(r.band8_answer)}</p><button class="small" id="hear">🔊 Nghe mẫu</button> <small>Mẹo shadowing: nghe từng câu rồi nói đuổi theo.</small></div>`;
        $("#hear", v).onclick = () => speak(r.band8_answer);
      } catch (e) { $("#msg", v).textContent = e.message; }
      $("#grade", v).disabled = false;
    };
  };
  draw();
};

// ================= Trang: Gia sư AI =================
const TUTOR_MODES = {
  tutor: ["Gia sư tự do", "Hỏi bất cứ điều gì: ngữ pháp, từ vựng, chiến lược thi."],
  examiner: ["Giám khảo Speaking", "Thi thử Speaking Part 1→3 bằng tiếng Anh. Gõ END để nhận chấm điểm."],
  corrector: ["Sửa câu", "Dán câu/đoạn văn để được sửa lỗi và nâng cấp lên band 8."],
  drill: ["Luyện phản xạ", "AI đưa câu tiếng Việt để bạn dịch, sửa ngay rồi tăng độ khó."],
  debate: ["Tranh luận", "Phản biện quan điểm — luyện ý cho Task 2 và Speaking Part 3."],
};
routes.tutor = (v) => {
  let mode = S.tutorMode || "tutor";
  const chats = (S.chats ||= {});
  const draw = () => {
    const msgs = (chats[mode] ||= []);
    v.innerHTML = `<h1>Giáo viên AI</h1>${aiNotice()}
      <div class="tabs">${Object.entries(TUTOR_MODES).map(([k, [n]]) => `<button data-k="${k}" class="${k === mode ? "on" : ""}">${n}</button>`).join("")}</div>
      <p class="muted">${esc(TUTOR_MODES[mode][1])}</p>
      <div class="chat" id="chat">${msgs.map((m) => `<div class="msg ${m.role}">${m.role === "assistant" ? md(m.content) : esc(m.content).replace(/\n/g, "<br>")}</div>`).join("")}</div>
      <form id="cf" class="card" style="padding:12px"><textarea id="ci" style="min-height:80px" placeholder="${mode === "examiner" ? "Gõ 'Hello, I'm ready' để bắt đầu…" : "Nhập tin nhắn… (Ctrl+Enter để gửi)"}"></textarea>
        <div class="row" style="margin-top:8px"><button class="primary" ${AI ? "" : "disabled"}>Gửi</button>${SRbtn()}<span class="spacer"></span><button type="button" class="small" id="clr">Xoá hội thoại</button></div></form>`;
    $$(".tabs button", v).forEach((b) => (b.onclick = () => { mode = S.tutorMode = b.dataset.k; save(); draw(); }));
    $("#clr", v).onclick = () => { chats[mode] = []; save(); draw(); };
    const ci = $("#ci", v);
    ci.onkeydown = (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) $("#cf", v).requestSubmit(); };
    wireMic(v, ci);
    $("#cf", v).addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = ci.value.trim(); if (!text) return;
      msgs.push({ role: "user", content: text }); ci.value = "";
      const chat = $("#chat", v);
      chat.insertAdjacentHTML("beforeend", `<div class="msg user">${esc(text).replace(/\n/g, "<br>")}</div><div class="msg assistant"><span class="loading">Đang trả lời…</span></div>`);
      const out = chat.lastElementChild; out.scrollIntoView({ block: "end" });
      let acc = "";
      try {
        const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode, messages: msgs.slice(-30) }) });
        if (!r.ok) throw new Error((await r.json()).error);
        const reader = r.body.getReader(), dec = new TextDecoder(); let buf = "";
        for (;;) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          const events = buf.split("\n\n"); buf = events.pop();
          for (const ev of events) {
            const d = JSON.parse(ev.replace(/^data: /, ""));
            if (d.text) { acc += d.text; out.innerHTML = md(acc); }
            if (d.error) throw new Error(d.error);
          }
        }
        msgs.push({ role: "assistant", content: acc }); save();
        if (mode === "examiner") speak(acc.split(/\n/)[0].slice(0, 400));
      } catch (err) {
        out.innerHTML = `<span style="color:var(--bad)">${esc(err.message)}</span>`;
        if (!acc) msgs.pop(); else msgs.push({ role: "assistant", content: acc });
        save();
      }
    });
  };
  draw();
};
function SRbtn() { return (window.SpeechRecognition || window.webkitSpeechRecognition) ? `<button type="button" id="mic">🎙 Nói</button>` : ""; }
function wireMic(v, target) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; const btn = $("#mic", v);
  if (!SR || !btn) return;
  let rec = null;
  btn.onclick = () => {
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = "en-GB"; rec.interimResults = true; rec.continuous = true;
    const base = target.value;
    rec.onresult = (e) => { let t = ""; for (const r of e.results) t += r[0].transcript + " "; target.value = (base + " " + t).trim(); };
    rec.onend = () => { rec = null; btn.textContent = "🎙 Nói"; };
    rec.start(); btn.textContent = "■ Dừng nói";
  };
  onLeave(() => rec?.stop());
}

// ================= Trang: Sổ lỗi sai =================
routes.mistakes = (v) => {
  let filter = "open";
  const draw = () => {
    const list = S.mistakes.filter((m) => filter === "all" || (filter === "open" ? !m.mastered : m.mastered));
    const cats = {}; S.mistakes.filter((m) => !m.mastered).forEach((m) => (cats[m.category] = (cats[m.category] || 0) + 1));
    v.innerHTML = `<h1>Sổ lỗi sai</h1><p class="muted">Mọi lỗi AI tìm thấy trong Writing/Speaking tự động vào đây. Cách ôn: che phần sửa, tự sửa lại câu gốc, rồi đánh dấu "Đã nắm" khi 2 lần liên tiếp tự sửa đúng.</p>
      <div class="row" style="margin-bottom:12px">${Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, n]) => `<span class="tag warn">${esc(c)}: ${n}</span>`).join("") || `<span class="muted">Chưa có lỗi nào.</span>`}</div>
      <div class="tabs"><button data-f="open" class="${filter === "open" ? "on" : ""}">Cần ôn</button><button data-f="done" class="${filter === "done" ? "on" : ""}">Đã nắm</button><button data-f="all" class="${filter === "all" ? "on" : ""}">Tất cả</button><span class="spacer"></span><button id="quiz" class="small">Ôn kiểu che đáp án</button></div>
      <div class="card" id="ml">${list.map((m) => `<div class="mistake"><div class="row"><span class="tag">${esc(m.category)}</span><small>${esc(m.source)} · ${esc(m.date)}</small><span class="spacer"></span><button class="small" data-id="${m.id}">${m.mastered ? "Ôn lại" : "Đã nắm"}</button></div>
        <del>${esc(m.original)}</del> <span class="fix">→ <ins>${esc(m.correction)}</ins><br><small>${esc(m.explanation)}</small></span></div>`).join("") || "<p class='muted'>Trống.</p>"}</div>`;
    $$(".tabs button[data-f]", v).forEach((b) => (b.onclick = () => { filter = b.dataset.f; draw(); }));
    $$("#ml button[data-id]", v).forEach((b) => (b.onclick = () => { const m = S.mistakes.find((x) => x.id === b.dataset.id); m.mastered = !m.mastered; save(); draw(); }));
    $("#quiz", v).onclick = () => $$(".fix", v).forEach((f) => { f.hidden = true; const s = document.createElement("button"); s.className = "small"; s.textContent = "Hiện cách sửa"; s.onclick = () => { f.hidden = false; s.remove(); }; f.after(s); });
  };
  draw();
};

// ================= Trang: Tiến độ =================
routes.progress = (v) => {
  const skills = ["reading", "listening", "writing", "speaking"];
  const colors = { reading: "#1f77b4", listening: "#d1793a", writing: "#2f8f5b", speaking: "#8a5cc7" };
  const W = 640, H = 220, pad = 30;
  const pts = S.bands.map((b, i) => ({ ...b, i }));
  const n = Math.max(2, pts.length);
  const x = (i) => pad + (i / (n - 1)) * (W - pad * 2), y = (b) => H - pad - ((b - 4) / 5) * (H - pad * 2);
  const lines = skills.map((s) => { const p = pts.filter((q) => q.skill === s); return p.length ? `<polyline fill="none" stroke="${colors[s]}" stroke-width="2" points="${p.map((q) => `${x(q.i)},${y(q.band)}`).join(" ")}"/>${p.map((q) => `<circle cx="${x(q.i)}" cy="${y(q.band)}" r="3.5" fill="${colors[s]}"><title>${s} ${q.band} (${q.date})</title></circle>`).join("")}` : ""; }).join("");
  const grid = [4, 5, 6, 7, 8, 9].map((b) => `<line x1="${pad}" x2="${W - pad}" y1="${y(b)}" y2="${y(b)}" stroke="currentColor" opacity="${b === 8 ? 0.5 : 0.12}" ${b === 8 ? 'stroke-dasharray="4 4"' : ""}/><text x="4" y="${y(b) + 4}">${b}</text>`).join("");
  const est = estimate();
  v.innerHTML = `<h1>Tiến độ</h1>
    <div class="grid">${skills.map((s, i) => `<div class="stat"><b>${est.sk[i] ?? "—"}</b><span>${s[0].toUpperCase() + s.slice(1)} · ${S[s].length} bài</span></div>`).join("")}<div class="stat"><b>${est.overall ?? "—"}</b><span>Overall ước tính</span></div></div>
    <div class="card" style="margin-top:16px;color:var(--line)"><h3 style="color:var(--ink)">Band theo thời gian (đường nét đứt = 8.0)</h3>
      ${pts.length ? `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Biểu đồ band">${grid}${lines}</svg>` : `<p class="muted">Chưa có dữ liệu — làm bài Reading/Listening/Writing/Speaking để xem biểu đồ.</p>`}
      <div class="row" style="color:var(--ink)">${skills.map((s) => `<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${colors[s]}"></span> ${s}</span>`).join("")}</div></div>
    <div class="card"><h3>Sao lưu dữ liệu</h3><p class="muted">Tiến độ được lưu trong <code>data/progress.json</code> của máy chủ và trong trình duyệt.</p>
      <div class="row"><button id="exp">Tải file sao lưu</button><label class="btn" style="margin:0;color:var(--ink)">Khôi phục từ file<input type="file" id="imp" accept=".json" hidden></label><span class="spacer"></span><button id="reset" class="small">Xoá toàn bộ & làm lại</button></div></div>`;
  $("#exp", v).onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: "application/json" })); a.download = `ielts8-backup-${today()}.json`; a.click(); };
  $("#imp", v).onchange = async (e) => { try { S = { ...DEFAULT(), ...JSON.parse(await e.target.files[0].text()) }; save(); render(); } catch { alert("File không hợp lệ."); } };
  $("#reset", v).onclick = () => { if (confirm("Xoá toàn bộ tiến độ? Không thể hoàn tác (trừ khi bạn đã tải file sao lưu).")) { S = DEFAULT(); save(); render(); } };
};

// ================= Khởi động =================
window.addEventListener("hashchange", render);
await load();
render();
