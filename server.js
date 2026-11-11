// IELTS 8.0 — máy chủ local: phục vụ giao diện, lưu tiến độ, và gọi giáo viên AI (Claude).
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, "public");
const STATE_FILE = path.join(here, "data", "progress.json");
const PORT = Number(process.env.PORT || 5173);
const MODEL = "claude-opus-5-5";

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const client = hasKey ? new Anthropic() : null;

// ---------- Prompt hệ thống ----------
const BASE = `Bạn là giáo viên IELTS cấp cao (cựu giám khảo), dạy học viên người Việt đang nhắm band 8.0 trong 3 tháng.
Nguyên tắc:
- Giải thích bằng tiếng Việt, ví dụ và câu mẫu bằng tiếng Anh.
- Chấm điểm nghiêm khắc theo public band descriptors của IELTS; không nâng điểm để động viên.
- Luôn chỉ ra lỗi cụ thể (trích nguyên văn), lý do, và cách sửa; ưu tiên lỗi ảnh hưởng band nhiều nhất.
- Gợi ý từ vựng/cấu trúc ở mức band 8+ nhưng tự nhiên, không "học thuộc".`;

const MODES = {
  tutor: `${BASE}\nChế độ: GIA SƯ TỰ DO. Trả lời câu hỏi về ngữ pháp, từ vựng, chiến lược thi. Ngắn gọn, có ví dụ. Cuối mỗi câu trả lời, đưa 1 bài tập nhỏ để học viên tự làm.`,
  examiner: `${BASE}\nChế độ: GIÁM KHẢO SPEAKING. Bạn đóng vai giám khảo, nói HOÀN TOÀN bằng tiếng Anh như phòng thi thật. Hỏi từng câu một (Part 1 → Part 2 cue card → Part 3), không nhận xét giữa chừng. Khi học viên gõ "END" hoặc sau khoảng 12 câu, dừng lại và đưa nhận xét bằng tiếng Việt: band ước tính cho Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy (Pronunciation không chấm được qua văn bản), các lỗi chính, và câu trả lời mẫu band 8 cho 2 câu yếu nhất.`,
  corrector: `${BASE}\nChế độ: SỬA CÂU. Với mỗi câu/đoạn học viên gửi: (1) bản sửa đúng, (2) liệt kê từng lỗi và lý do, (3) một phiên bản nâng cấp band 8+. Trình bày dạng gạch đầu dòng.`,
  drill: `${BASE}\nChế độ: LUYỆN PHẢN XẠ. Mỗi lượt đưa 1 câu tiếng Việt để học viên dịch sang tiếng Anh học thuật, hoặc 1 câu hỏi Speaking ngắn. Sau khi học viên trả lời, chấm nhanh (đúng/chưa), sửa, cho phiên bản tốt hơn, rồi đưa câu tiếp theo khó hơn một chút.`,
  debate: `${BASE}\nChế độ: TRANH LUẬN (chuẩn bị Writing Task 2 / Speaking Part 3). Đưa ra một quan điểm về chủ đề học viên chọn, phản biện lập luận của học viên bằng tiếng Anh, sau đó nhận xét ngắn bằng tiếng Việt về chất lượng lập luận và ngôn ngữ.`,
};

// ---------- Lược đồ JSON cho các bài chấm ----------
const S = (type, extra = {}) => ({ type, ...extra });
const obj = (props) => ({ type: "object", properties: props, required: Object.keys(props), additionalProperties: false });
const arr = (items) => ({ type: "array", items });

const criterion = obj({ band: S("number"), comment: S("string") });
const mistake = obj({ original: S("string"), correction: S("string"), explanation: S("string"), category: S("string") });

const SCHEMAS = {
  writing: obj({
    overall_band: S("number"),
    criteria: obj({ task: criterion, coherence_cohesion: criterion, lexical_resource: criterion, grammar: criterion }),
    strengths: arr(S("string")),
    priorities: arr(S("string")),
    mistakes: arr(mistake),
    band8_version: S("string"),
  }),
  speaking: obj({
    overall_band: S("number"),
    criteria: obj({ fluency_coherence: criterion, lexical_resource: criterion, grammar: criterion }),
    strengths: arr(S("string")),
    priorities: arr(S("string")),
    mistakes: arr(mistake),
    band8_answer: S("string"),
  }),
  reading: obj({
    title: S("string"),
    passage: S("string"),
    questions: arr(obj({ type: S("string"), question: S("string"), options: arr(S("string")), answer: S("string"), explanation: S("string") })),
  }),
  listening: obj({
    title: S("string"),
    context: S("string"),
    script: S("string"),
    questions: arr(obj({ question: S("string"), answer: S("string"), explanation: S("string") })),
  }),
};

// ---------- Gọi Claude ----------
function baseParams(extra) {
  return {
    model: MODEL,
    // Tự động chuyển sang model dự phòng nếu yêu cầu bị bộ lọc an toàn từ chối.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    ...extra,
  };
}

function textOf(msg) {
  return msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
}

async function structured(schemaName, system, userText, effort = "high") {
  const stream = client.beta.messages.stream(
    baseParams({
      max_tokens: 32000,
      system,
      output_config: { effort, format: { type: "json_schema", schema: SCHEMAS[schemaName] } },
      messages: [{ role: "user", content: userText }],
    }),
  );
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") throw new Error("Yêu cầu bị từ chối bởi bộ lọc an toàn.");
  if (msg.stop_reason === "max_tokens") throw new Error("Phản hồi quá dài, bị cắt. Hãy thử lại.");
  return JSON.parse(textOf(msg));
}

const handlers = {
  async "grade-writing"({ task, prompt, essay, minutes }) {
    return structured(
      "writing",
      BASE,
      `Chấm bài IELTS Writing ${task === "task1" ? "Task 1 (Academic)" : "Task 2"} sau.
Thời gian làm: ${minutes ?? "?"} phút. Số từ: ${essay.trim().split(/\s+/).length}.
Đề bài: """${prompt}"""
Bài làm: """${essay}"""
Yêu cầu: band từng tiêu chí (bước 0.5), overall theo cách làm tròn của IELTS; nhận xét tiếng Việt; tối đa 12 lỗi quan trọng nhất (category: grammar | vocabulary | coherence | task); priorities là 3 việc cần làm để lên band; band8_version là bản viết lại hoàn chỉnh ở band 8+ giữ ý tưởng của học viên.`,
    );
  },
  async "grade-speaking"({ part, question, transcript }) {
    return structured(
      "speaking",
      BASE,
      `Chấm câu trả lời IELTS Speaking ${part} (bản ghi văn bản, có thể có lỗi nhận dạng giọng nói — đừng phạt lỗi chính tả).
Câu hỏi: """${question}"""
Bản ghi: """${transcript}"""
Nhận xét tiếng Việt; tối đa 8 lỗi (category: grammar | vocabulary | coherence); band8_answer là câu trả lời mẫu band 8 tự nhiên, độ dài phù hợp với ${part}.`,
    );
  },
  async "gen-reading"({ topic, level }) {
    return structured(
      "reading",
      BASE,
      `Soạn 1 bài IELTS Academic Reading GỐC (không sao chép đề thật) chủ đề "${topic || "khoa học/xã hội ngẫu nhiên"}", độ khó tương ứng band ${level || 7.5}.
Passage 650–800 từ, chia đoạn có ký hiệu A, B, C... Viết 10 câu hỏi trộn các dạng: TRUE/FALSE/NOT GIVEN (options = ["TRUE","FALSE","NOT GIVEN"]), multiple choice (options 4 lựa chọn "A. ...") , sentence completion (options = [], answer tối đa 2 từ lấy từ bài). answer phải khớp chính xác 1 phần tử options nếu có options. explanation bằng tiếng Việt, trích dẫn đoạn liên quan.`,
      "medium",
    );
  },
  async "gen-listening"({ section, topic }) {
    return structured(
      "listening",
      BASE,
      `Soạn 1 bài IELTS Listening GỐC Section ${section || 2}, chủ đề "${topic || "ngẫu nhiên"}".
script: lời thoại/độc thoại tiếng Anh 400–550 từ (nếu là hội thoại, ghi "MAN:", "WOMAN:" đầu mỗi lượt). context: 1 câu giới thiệu như trong đề thật.
10 câu hỏi dạng điền từ (form/note completion), đáp án tối đa 3 từ hoặc 1 con số, xuất hiện nguyên văn trong script, theo đúng thứ tự xuất hiện. Có cài bẫy như đề thật (đính chính, đánh vần tên). explanation tiếng Việt.`,
      "medium",
    );
  },
};

// ---------- HTTP ----------
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml" };

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJSON(res, code, data) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function errorMessage(err) {
  if (err instanceof Anthropic.AuthenticationError) return "API key không hợp lệ.";
  if (err instanceof Anthropic.RateLimitError) return "Đang bị giới hạn tốc độ, thử lại sau ít phút.";
  if (err instanceof Anthropic.APIConnectionError) return "Không kết nối được tới Claude API (kiểm tra mạng).";
  if (err instanceof Anthropic.APIError) return `Lỗi API (${err.status}): ${err.message}`;
  return err?.message || String(err);
}

async function handleChat(req, res) {
  const { mode = "tutor", messages = [] } = await readBody(req);
  res.writeHead(200, { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache", connection: "keep-alive" });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  try {
    const stream = client.beta.messages.stream(
      baseParams({
        max_tokens: 16000,
        system: [{ type: "text", text: MODES[mode] || MODES.tutor, cache_control: { type: "ephemeral" } }],
        output_config: { effort: "low" },
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    );
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") send({ text: ev.delta.text });
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") send({ error: "Yêu cầu bị từ chối bởi bộ lọc an toàn." });
    send({ done: true });
  } catch (err) {
    send({ error: errorMessage(err) });
  }
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/api/status") return sendJSON(res, 200, { ai: hasKey, model: MODEL });

    if (url.pathname === "/api/state") {
      if (req.method === "GET") {
        try { return sendJSON(res, 200, JSON.parse(await fs.readFile(STATE_FILE, "utf8"))); }
        catch { return sendJSON(res, 200, null); }
      }
      if (req.method === "PUT") {
        const body = await readBody(req);
        await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
        const tmp = STATE_FILE + ".tmp";
        await fs.writeFile(tmp, JSON.stringify(body, null, 1));
        await fs.rename(tmp, STATE_FILE);
        return sendJSON(res, 200, { ok: true });
      }
    }

    if (url.pathname.startsWith("/api/")) {
      if (!client) return sendJSON(res, 503, { error: "Chưa cấu hình ANTHROPIC_API_KEY — xem README.md." });
      if (url.pathname === "/api/chat" && req.method === "POST") return handleChat(req, res);
      const name = url.pathname.slice(5);
      if (handlers[name] && req.method === "POST") {
        try { return sendJSON(res, 200, await handlers[name](await readBody(req))); }
        catch (err) { console.error(err); return sendJSON(res, 500, { error: errorMessage(err) }); }
      }
      return sendJSON(res, 404, { error: "Không có endpoint này" });
    }

    // File tĩnh
    let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
    if (!p) p = "index.html";
    const file = path.join(PUBLIC, p);
    if (!file.startsWith(PUBLIC)) return sendJSON(res, 403, { error: "forbidden" });
    const data = await fs.readFile(file).catch(() => null);
    if (!data) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJSON(res, 500, { error: errorMessage(err) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`IELTS 8.0 đang chạy: http://localhost:${PORT}`);
  console.log(hasKey ? `Giáo viên AI: BẬT (${MODEL})` : "Giáo viên AI: TẮT — đặt ANTHROPIC_API_KEY để bật.");
});
