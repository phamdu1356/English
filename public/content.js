// Nội dung học: bài test đầu vào, lộ trình 12 tuần, bộ từ vựng, đề Writing/Speaking.
// Toàn bộ là nội dung tự soạn (không sao chép đề thi thật).

// ---------------- TEST ĐẦU VÀO ----------------
// level: độ khó xấp xỉ band của câu hỏi
export const PLACEMENT = {
  grammar: [
    { q: "By the time the report is published, the committee ___ its recommendations.", o: ["will finalise", "will have finalised", "has finalised", "finalised"], a: 1, level: 6 },
    { q: "___ the heavy rain, the match went ahead as planned.", o: ["Although", "Despite", "However", "Even"], a: 1, level: 5 },
    { q: "Rarely ___ such a dramatic shift in public opinion.", o: ["we have seen", "have we seen", "we saw", "did we saw"], a: 1, level: 7 },
    { q: "The number of students enrolling in online courses ___ sharply since 2015.", o: ["have risen", "has risen", "rose", "is rising"], a: 1, level: 6 },
    { q: "Had the government invested earlier, the crisis ___.", o: ["would be avoided", "would have been avoided", "will be avoided", "had been avoided"], a: 1, level: 7 },
    { q: "She suggested that he ___ a specialist.", o: ["sees", "see", "would seeing", "to see"], a: 1, level: 7.5 },
    { q: "It is high time governments ___ action on plastic waste.", o: ["take", "took", "have taken", "will take"], a: 1, level: 7.5 },
    { q: "The proposal, ___ was rejected last year, has been revised.", o: ["that", "which", "what", "who"], a: 1, level: 5.5 },
    { q: "Not only ___ the deadline, but they also exceeded expectations.", o: ["they met", "did they meet", "they did meet", "met they"], a: 1, level: 7 },
    { q: "Little ___ that the decision would change her career.", o: ["she knew", "did she know", "she did know", "knew she"], a: 1, level: 7.5 },
  ],
  vocab: [
    { q: "The new policy had a ___ effect on unemployment, reducing it by half.", o: ["marginal", "profound", "trivial", "vague"], a: 1, level: 6 },
    { q: "Choose the best collocation: ___ a conclusion", o: ["make", "draw", "do", "take"], a: 1, level: 6 },
    { q: "Urban sprawl can ___ pressure on public infrastructure.", o: ["exert", "execute", "exhaust", "exempt"], a: 0, level: 7 },
    { q: "'Mitigate' is closest in meaning to:", o: ["worsen", "lessen", "ignore", "measure"], a: 1, level: 6.5 },
    { q: "The evidence is ___; we cannot draw firm conclusions.", o: ["conclusive", "inconclusive", "convincing", "compelling"], a: 1, level: 6 },
    { q: "The scheme proved to be a ___ — costly and ineffective.", o: ["white elephant", "red herring", "black sheep", "grey area"], a: 0, level: 8 },
    { q: "A ___ argument is one that is logical and convincing.", o: ["cogent", "candid", "covert", "callous"], a: 0, level: 8 },
    { q: "Choose the correct word: The film was ___ by critics.", o: ["acclaimed", "claimed", "exclaimed", "reclaimed"], a: 0, level: 7 },
    { q: "Governments should ___ incentives for renewable energy.", o: ["provide", "procure", "prevail", "pertain"], a: 0, level: 5 },
    { q: "His remarks were ___ to the discussion and wasted time.", o: ["pertinent", "extraneous", "integral", "salient"], a: 1, level: 8 },
  ],
  reading: {
    title: "The Quiet Return of Urban Rivers",
    passage: `For much of the twentieth century, many cities treated their rivers as inconveniences. Streams that had once supplied water and transport were buried beneath concrete culverts, converted into storm drains, or straightened into channels designed solely to move water away as quickly as possible. Engineers of the period regarded this as progress: covered waterways freed land for roads and housing, and reduced the odours associated with polluted water.

In recent decades, however, a movement known as "daylighting" has sought to reverse this trend. Daylighting involves removing the structures that conceal a river and restoring something resembling its natural course. Advocates argue that open rivers reduce flood risk, because meandering channels and vegetated banks slow the flow of water during storms. They also point to evidence that restored waterways lower local air temperatures in summer and increase the value of nearby property.

Critics are not persuaded that the benefits always justify the costs. Daylighting projects can require the demolition of existing roads, and their price frequently exceeds initial estimates. Some hydrologists also caution that a restored river in a dense city can never be truly "natural", since its catchment area remains covered in impermeable surfaces. Nevertheless, the number of such projects worldwide has grown steadily, and several cities now require that any major redevelopment consider the possibility of uncovering buried streams.`,
    questions: [
      { q: "Early twentieth-century engineers considered covering rivers to be an improvement.", o: ["TRUE", "FALSE", "NOT GIVEN"], a: 0 },
      { q: "Daylighting projects always restore a river exactly to its original course.", o: ["TRUE", "FALSE", "NOT GIVEN"], a: 1 },
      { q: "Restored rivers have been shown to reduce crime in nearby areas.", o: ["TRUE", "FALSE", "NOT GIVEN"], a: 2 },
      { q: "According to the passage, open rivers can reduce flooding because they", o: ["A. carry water away faster", "B. slow the movement of water", "C. are deeper than culverts", "D. are cleaned more often"], a: 1 },
      { q: "Some hydrologists doubt that urban rivers can be fully natural because", o: ["A. the water is still polluted", "B. projects run over budget", "C. the surrounding land remains largely impermeable", "D. roads must be demolished"], a: 2 },
      { q: "The costs of daylighting projects are usually lower than predicted.", o: ["TRUE", "FALSE", "NOT GIVEN"], a: 1 },
    ],
  },
  writingPrompt: "Some people believe that university education should be free for all students. To what extent do you agree or disagree? (Viết 150–250 từ trong 20 phút)",
};

// ---------------- LỘ TRÌNH 12 TUẦN ----------------
export const PHASES = [
  { name: "Giai đoạn 1 — Nền tảng", weeks: [1, 4], goal: "Sửa lỗi ngữ pháp gốc, xây 1.000 từ học thuật, làm quen 4 kỹ năng và format đề." },
  { name: "Giai đoạn 2 — Tăng tốc", weeks: [5, 8], goal: "Viết đúng cấu trúc band 7+, mở rộng ý Speaking, luyện đề theo dạng câu hỏi." },
  { name: "Giai đoạn 3 — Về đích 8.0", weeks: [9, 12], goal: "Thi thử full test, tinh chỉnh từ vựng/collocation band 8, quản lý thời gian và tâm lý." },
];

export const WEEKS = [
  { w: 1, focus: "Thì & cấu trúc câu cơ bản; Reading: skimming/scanning; Task 2: phân tích đề; Speaking Part 1 (bản thân, công việc, quê hương)" },
  { w: 2, focus: "Câu phức & mệnh đề quan hệ; Reading: TRUE/FALSE/NOT GIVEN; Listening Section 1–2; Task 2 dạng Opinion" },
  { w: 3, focus: "Bị động & danh từ hoá; Task 1: Line/Bar chart; Speaking Part 2 cấu trúc 4 ý; Listening: bẫy đính chính" },
  { w: 4, focus: "Mạo từ, giới từ, mạo từ số ít/nhiều; Reading: Matching headings; Task 2 dạng Discussion; Mini test tuần 4" },
  { w: 5, focus: "Câu điều kiện & đảo ngữ; Task 1: Table/Pie; Speaking Part 3 (giải thích nguyên nhân – hệ quả)" },
  { w: 6, focus: "Linking & cohesion nâng cao; Reading: Matching information; Listening Section 3; Task 2 Problem–Solution" },
  { w: 7, focus: "Collocation theo chủ đề (Môi trường, Giáo dục, Công nghệ); Task 1: Process & Map; Speaking Part 2 kể chuyện tự nhiên" },
  { w: 8, focus: "Hedging & ngôn ngữ học thuật; Listening Section 4; Task 2 Advantages–Disadvantages; Full test #1" },
  { w: 9, focus: "Chiến lược 60 phút Reading; Writing tốc độ 40 phút; Speaking idioms tự nhiên (không lạm dụng); Full test #2" },
  { w: 10, focus: "Sửa lỗi lặp lại trong Sổ lỗi sai; Paraphrase nâng cao; Speaking Part 3 phản biện; Full test #3" },
  { w: 11, focus: "Thi thử điều kiện thật 2 lần; chấm Writing kỹ từng tiêu chí; ôn từ vựng SRS cường độ cao" },
  { w: 12, focus: "Giảm tải, ôn lỗi sai, ngủ đủ; 1 full test đầu tuần; luyện Speaking nhẹ mỗi ngày; chuẩn bị giấy tờ thi" },
];

// Khung ngày ~2.5h. Ngày 7 mỗi tuần là ôn tập + thi thử nhỏ.
export function dailyTasks(week, dayOfWeek) {
  if (dayOfWeek === 7) {
    return [
      { id: "review", label: "Ôn toàn bộ thẻ từ vựng đến hạn", min: 20, link: "#/vocab" },
      { id: "mistakes", label: "Đọc lại Sổ lỗi sai, viết lại 5 câu đã sửa", min: 20, link: "#/mistakes" },
      { id: week >= 8 ? "fulltest" : "minitest", label: week >= 8 ? "Thi thử ĐỀ THẬT: 1 Listening + 1 Reading (Cambridge/chính thức) + 1 Task 2 + Speaking giám khảo AI" : "Mini test: 1 Reading + 1 Listening AI tạo", min: week >= 8 ? 150 : 60, link: week >= 8 ? "#/real" : "#/reading" },
    ];
  }
  const writing = dayOfWeek % 2 === 1
    ? { id: "writing", label: week <= 2 ? "Writing Task 2 (không giới hạn giờ) + AI chấm" : "Writing Task 2 — 40 phút + AI chấm", min: 50, link: "#/writing" }
    : { id: "writing", label: "Writing Task 1 — 20 phút + AI chấm", min: 30, link: "#/writing" };
  const rl = dayOfWeek % 2 === 1
    ? { id: "reading", label: "Reading: 1 passage AI tạo (20 phút) + phân tích câu sai", min: 35, link: "#/reading" }
    : { id: "listening", label: "Listening: 1 section AI tạo + nghe lại chép chính tả đoạn sai", min: 35, link: "#/listening" };
  return [
    { id: "vocab", label: "Từ vựng SRS: ôn thẻ đến hạn + 15 từ mới", min: 20, link: "#/vocab" },
    rl,
    writing,
    { id: "speaking", label: "Speaking: 3 câu Part 1 + 1 cue card, ghi âm & AI chấm", min: 30, link: "#/speaking" },
    { id: "tutor", label: "Hỏi gia sư AI 1 điểm ngữ pháp trong trọng tâm tuần", min: 15, link: "#/tutor" },
  ];
}

// ---------------- TỪ VỰNG HỌC THUẬT ----------------
// [từ, loại, nghĩa tiếng Việt, ví dụ, collocation]
const RAW_VOCAB = [
  ["mitigate", "v", "giảm nhẹ", "Planting trees can mitigate the effects of urban heat.", "mitigate the impact/risk"],
  ["exacerbate", "v", "làm trầm trọng thêm", "Lockdowns exacerbated existing inequalities.", "exacerbate a problem"],
  ["alleviate", "v", "xoa dịu, giảm bớt", "Subsidies may alleviate poverty in rural areas.", "alleviate poverty/pressure"],
  ["detrimental", "adj", "có hại", "Excessive screen time is detrimental to children's sleep.", "detrimental effect on"],
  ["conducive", "adj", "có lợi cho, tạo điều kiện", "A quiet environment is conducive to learning.", "conducive to"],
  ["pervasive", "adj", "lan tràn, phổ biến khắp", "Social media has a pervasive influence on teenagers.", "pervasive influence"],
  ["unprecedented", "adj", "chưa từng có", "The city saw unprecedented growth in the 1990s.", "unprecedented scale/growth"],
  ["inevitable", "adj", "không thể tránh khỏi", "Some job losses are inevitable as automation spreads.", "an inevitable consequence"],
  ["feasible", "adj", "khả thi", "A four-day working week may not be feasible for hospitals.", "economically feasible"],
  ["viable", "adj", "khả thi, sống còn được", "Solar power is now a viable alternative to coal.", "a viable alternative/option"],
  ["incentive", "n", "động lực, ưu đãi", "Tax incentives encourage companies to go green.", "provide an incentive"],
  ["deterrent", "n", "biện pháp răn đe", "Heavy fines act as a deterrent to littering.", "act as a deterrent"],
  ["disparity", "n", "sự chênh lệch", "There is a growing disparity between rich and poor.", "income disparity"],
  ["scrutiny", "n", "sự xem xét kỹ", "Tech companies are under intense public scrutiny.", "come under scrutiny"],
  ["consensus", "n", "sự đồng thuận", "There is a scientific consensus on climate change.", "reach a consensus"],
  ["prerequisite", "n", "điều kiện tiên quyết", "Literacy is a prerequisite for economic development.", "a prerequisite for"],
  ["proliferation", "n", "sự gia tăng nhanh", "The proliferation of smartphones changed communication.", "the proliferation of"],
  ["sustainable", "adj", "bền vững", "Cities must adopt sustainable transport policies.", "sustainable development"],
  ["accountable", "adj", "chịu trách nhiệm", "Politicians should be held accountable for their decisions.", "hold sb accountable"],
  ["advocate", "v/n", "ủng hộ; người ủng hộ", "Many experts advocate stricter gun laws.", "a strong advocate of"],
  ["undermine", "v", "làm suy yếu", "Corruption undermines public trust.", "undermine confidence/trust"],
  ["foster", "v", "nuôi dưỡng, thúc đẩy", "Team sports foster cooperation among children.", "foster creativity"],
  ["curb", "v", "kiềm chế", "Governments must curb carbon emissions.", "curb spending/emissions"],
  ["impose", "v", "áp đặt", "The state imposed a tax on sugary drinks.", "impose restrictions/a ban"],
  ["allocate", "v", "phân bổ", "More funding should be allocated to public health.", "allocate resources/funds"],
  ["prioritise", "v", "ưu tiên", "Schools should prioritise mental health.", "prioritise safety"],
  ["compelling", "adj", "thuyết phục", "There is compelling evidence that exercise improves mood.", "compelling evidence/argument"],
  ["tangible", "adj", "hữu hình, rõ ràng", "The reforms produced tangible benefits.", "tangible results"],
  ["profound", "adj", "sâu sắc", "The internet has had a profound impact on education.", "profound impact/effect"],
  ["substantial", "adj", "đáng kể", "A substantial proportion of graduates work abroad.", "substantial increase"],
  ["marginal", "adj", "không đáng kể, bên lề", "The change led to only a marginal improvement.", "marginal increase"],
  ["fluctuate", "v", "dao động", "Oil prices fluctuated wildly in 2008.", "fluctuate between X and Y"],
  ["plummet", "v", "giảm mạnh", "Sales plummeted after the scandal.", "plummet to"],
  ["surge", "v/n", "tăng vọt", "There was a surge in online shopping.", "a surge in demand"],
  ["plateau", "v/n", "chững lại", "Figures plateaued at around 40%.", "reach a plateau"],
  ["account for", "phr v", "chiếm (tỷ lệ)", "Coal accounted for 30% of energy production.", "account for X%"],
  ["respectively", "adv", "lần lượt", "France and Italy recorded 20% and 25% respectively.", "X and Y respectively"],
  ["whereas", "conj", "trong khi (đối lập)", "Men preferred football, whereas women chose swimming.", "—"],
  ["notwithstanding", "prep", "mặc dù", "Notwithstanding its cost, the project was approved.", "notwithstanding the cost"],
  ["albeit", "conj", "mặc dù (rút gọn)", "The economy grew, albeit slowly.", "albeit slowly/briefly"],
  ["consequently", "adv", "do đó", "Prices rose; consequently, demand fell.", "—"],
  ["arguably", "adv", "có thể cho là", "Education is arguably the most important investment.", "arguably the best"],
  ["inherently", "adv", "vốn dĩ", "No technology is inherently good or bad.", "inherently risky"],
  ["a double-edged sword", "idiom", "con dao hai lưỡi", "Social media is a double-edged sword for young people.", "—"],
  ["stem from", "phr v", "bắt nguồn từ", "Many health problems stem from poor diet.", "stem from a lack of"],
  ["give rise to", "phr v", "gây ra", "Rapid urbanisation gives rise to traffic congestion.", "give rise to concerns"],
  ["bring about", "phr v", "mang lại, gây ra", "Technology has brought about huge changes.", "bring about change"],
  ["cope with", "phr v", "đối phó với", "Hospitals struggle to cope with demand.", "cope with pressure"],
  ["sedentary", "adj", "ít vận động", "A sedentary lifestyle increases obesity risk.", "sedentary lifestyle"],
  ["obesity", "n", "béo phì", "Childhood obesity is rising worldwide.", "tackle obesity"],
  ["curriculum", "n", "chương trình học", "Coding should be part of the school curriculum.", "national curriculum"],
  ["vocational", "adj", "hướng nghiệp", "Vocational training reduces youth unemployment.", "vocational training/course"],
  ["rote learning", "n", "học vẹt", "Rote learning discourages critical thinking.", "rely on rote learning"],
  ["critical thinking", "n", "tư duy phản biện", "Debate develops critical thinking skills.", "develop critical thinking"],
  ["biodiversity", "n", "đa dạng sinh học", "Deforestation threatens biodiversity.", "loss of biodiversity"],
  ["emissions", "n", "khí thải", "Aviation produces significant carbon emissions.", "reduce/cut emissions"],
  ["renewable", "adj", "tái tạo", "Renewable energy is becoming cheaper.", "renewable energy/sources"],
  ["depletion", "n", "sự cạn kiệt", "The depletion of fish stocks worries scientists.", "resource depletion"],
  ["urbanisation", "n", "đô thị hoá", "Urbanisation has transformed Asian economies.", "rapid urbanisation"],
  ["infrastructure", "n", "cơ sở hạ tầng", "Poor infrastructure limits rural growth.", "invest in infrastructure"],
  ["congestion", "n", "tắc nghẽn", "Congestion charges reduced traffic in London.", "traffic congestion"],
  ["automation", "n", "tự động hoá", "Automation may replace many routine jobs.", "the rise of automation"],
  ["obsolete", "adj", "lỗi thời", "Many skills become obsolete quickly.", "become obsolete"],
  ["privacy", "n", "sự riêng tư", "Smart devices raise privacy concerns.", "invade/protect privacy"],
  ["surveillance", "n", "sự giám sát", "CCTV surveillance is widespread in cities.", "mass surveillance"],
  ["globalisation", "n", "toàn cầu hoá", "Globalisation has spread Western culture.", "the effects of globalisation"],
  ["homogenise", "v", "đồng nhất hoá", "Tourism can homogenise local cultures.", "homogenise culture"],
  ["heritage", "n", "di sản", "Governments should protect cultural heritage.", "cultural heritage"],
  ["indigenous", "adj", "bản địa", "Indigenous languages are disappearing.", "indigenous people/culture"],
  ["affluent", "adj", "giàu có", "Affluent families can afford private tutors.", "affluent societies"],
  ["deprived", "adj", "thiếu thốn", "Children from deprived areas need extra support.", "socially deprived"],
  ["welfare", "n", "phúc lợi", "Welfare systems protect the vulnerable.", "social welfare"],
  ["vulnerable", "adj", "dễ bị tổn thương", "The elderly are vulnerable to heatwaves.", "vulnerable groups"],
  ["life expectancy", "n", "tuổi thọ trung bình", "Life expectancy has risen globally.", "increase life expectancy"],
  ["ageing population", "n", "dân số già", "An ageing population strains pension systems.", "cope with an ageing population"],
  ["juvenile delinquency", "n", "tội phạm vị thành niên", "Poverty is linked to juvenile delinquency.", "reduce juvenile delinquency"],
  ["rehabilitation", "n", "sự cải tạo, phục hồi", "Prisons should focus on rehabilitation.", "rehabilitation programmes"],
  ["recidivism", "n", "tái phạm", "Education in prison lowers recidivism.", "reduce recidivism rates"],
  ["commodity", "n", "hàng hoá", "Water is becoming a precious commodity.", "a valuable commodity"],
  ["consumerism", "n", "chủ nghĩa tiêu dùng", "Advertising fuels consumerism.", "rampant consumerism"],
  ["materialistic", "adj", "thực dụng, vật chất", "Young people are seen as more materialistic.", "materialistic values"],
  ["philanthropy", "n", "hoạt động từ thiện", "Philanthropy cannot replace public services.", "corporate philanthropy"],
  ["altruistic", "adj", "vị tha", "Volunteering is an altruistic act.", "altruistic motives"],
  ["autonomy", "n", "quyền tự chủ", "Teachers need more autonomy.", "grant autonomy"],
  ["hierarchy", "n", "hệ thống thứ bậc", "Flat hierarchies encourage innovation.", "rigid hierarchy"],
  ["telecommuting", "n", "làm việc từ xa", "Telecommuting reduces commuting time.", "the rise of telecommuting"],
  ["work-life balance", "n", "cân bằng công việc – cuộc sống", "Flexible hours improve work-life balance.", "achieve a work-life balance"],
  ["burnout", "n", "kiệt sức", "Long hours lead to burnout.", "suffer from burnout"],
  ["empirical", "adj", "thực nghiệm", "There is little empirical evidence for this claim.", "empirical evidence/study"],
  ["hypothesis", "n", "giả thuyết", "The data support the hypothesis.", "test a hypothesis"],
  ["correlation", "n", "sự tương quan", "There is a strong correlation between income and health.", "a strong correlation between"],
  ["anecdotal", "adj", "dựa trên giai thoại", "The evidence is largely anecdotal.", "anecdotal evidence"],
  ["paramount", "adj", "tối quan trọng", "Safety is of paramount importance.", "of paramount importance"],
  ["indispensable", "adj", "không thể thiếu", "The internet is indispensable for modern business.", "indispensable to/for"],
  ["outweigh", "v", "vượt trội hơn", "The benefits outweigh the drawbacks.", "outweigh the disadvantages"],
  ["contentious", "adj", "gây tranh cãi", "Immigration is a contentious issue.", "a contentious issue"],
  ["ubiquitous", "adj", "có mặt khắp nơi", "Smartphones are now ubiquitous.", "ubiquitous technology"],
  ["detract from", "phr v", "làm giảm giá trị", "Advertising detracts from the beauty of cities.", "detract from the quality"],
  ["at the expense of", "phr", "đánh đổi bằng", "Growth came at the expense of the environment.", "—"],
];

export const VOCAB = RAW_VOCAB.map(([word, pos, vi, ex, col], i) => ({ id: "w" + i, word, pos, vi, ex, col }));

// ---------------- ĐỀ WRITING ----------------
export const WRITING_PROMPTS = {
  task1: [
    "The line graph shows the percentage of households with internet access in three countries (A, B, C) from 2000 to 2020. Country A rose from 20% to 95%, Country B from 5% to 70%, Country C from 40% to 85% but levelled off after 2012. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    "The bar chart compares the average weekly hours spent on four leisure activities (sport, social media, reading, TV) by people aged 15–24 and 55–64 in 2023. Young people: 4, 18, 2, 6. Older people: 3, 5, 6, 15. Summarise the information and make comparisons where relevant.",
    "The table shows the proportion of energy produced from coal, gas, nuclear and renewables in a country in 1990, 2005 and 2020. Coal: 60%, 45%, 15%. Gas: 20%, 30%, 35%. Nuclear: 15%, 15%, 10%. Renewables: 5%, 10%, 40%. Summarise and compare.",
    "The diagram shows the process of recycling glass bottles: collection → sorting by colour → crushing into cullet → melting with sand at 1,500°C → moulding into new bottles → filling and distribution. Summarise the information by describing the main stages.",
    "Two maps show a coastal town in 1995 and today. In 1995: a fishing harbour, farmland in the north, a single road. Today: the harbour became a marina, farmland replaced by hotels and a golf course, a new ring road and a car park near the beach. Summarise the main changes.",
    "The pie charts show how an average household budget was spent in 2000 and 2020. 2000: housing 30%, food 25%, transport 15%, entertainment 10%, other 20%. 2020: housing 40%, food 15%, transport 12%, entertainment 18%, other 15%. Summarise and compare.",
  ],
  task2: [
    "Some people think that governments should spend money on public transport rather than building new roads. To what extent do you agree or disagree?",
    "In many countries, the number of people living alone is increasing. What are the reasons for this? Is it a positive or negative development?",
    "Some argue that children should start learning a foreign language at primary school rather than secondary school. Do the advantages of this outweigh the disadvantages?",
    "Many believe that the best way to reduce crime is to give longer prison sentences. Others think there are better alternatives. Discuss both views and give your opinion.",
    "Artificial intelligence will soon replace many jobs that require professional training, such as doctors and lawyers. To what extent do you agree or disagree?",
    "Some people believe that tourism does more harm than good to local communities. To what extent do you agree?",
    "Rich countries should be responsible for helping poorer countries deal with climate change. To what extent do you agree or disagree?",
    "Nowadays, many people choose to work from home. Do the advantages of this trend outweigh its disadvantages?",
    "Some people think that museums should be free of charge, while others believe visitors should pay. Discuss both views and give your opinion.",
    "Young people today are more influenced by social media influencers than by their parents or teachers. Why is this the case? What problems might this cause?",
    "Governments should invest more in the arts than in sports. To what extent do you agree or disagree?",
    "Some say that the main purpose of schools is to prepare children for the workplace. Others believe schools should focus on personal development. Discuss both views and give your opinion.",
    "Fast food is becoming more common in many countries. What problems does this cause, and what solutions can you suggest?",
    "Space exploration is a waste of money that could be spent on problems on Earth. To what extent do you agree or disagree?",
    "Older people often find it difficult to adapt to new technology. What are the causes, and how can this problem be solved?",
  ],
};

// ---------------- ĐỀ SPEAKING ----------------
export const SPEAKING = {
  part1: [
    "Do you work or are you a student?", "What do you like most about your hometown?", "How do you usually spend your weekends?",
    "Do you prefer reading books or watching films?", "How often do you use public transport?", "Did you enjoy science lessons at school?",
    "What kind of music do you listen to?", "Do you like cooking? Why or why not?", "How has your neighbourhood changed in recent years?",
    "Do you think handwriting is still important?", "What do you usually do to relax?", "Do you prefer mornings or evenings?",
    "Have you ever visited a museum?", "How important is the weather to you?", "Do you like taking photos?",
  ],
  part2: [
    { cue: "Describe a skill you learned that took a long time to master.", points: ["what the skill was", "when and how you learned it", "what difficulties you faced", "and explain how you feel about it now"] },
    { cue: "Describe a time you changed your mind about something important.", points: ["what it was about", "what you thought before", "what made you change your mind", "and explain how you felt afterwards"] },
    { cue: "Describe a place in your city where people go to relax.", points: ["where it is", "what it looks like", "what people do there", "and explain why it is popular"] },
    { cue: "Describe a person who has influenced your career choice.", points: ["who the person is", "how you know them", "what they did", "and explain how they influenced you"] },
    { cue: "Describe a piece of technology you find difficult to use.", points: ["what it is", "when you started using it", "why it is difficult", "and explain how you feel about it"] },
    { cue: "Describe a time you helped someone in your community.", points: ["who you helped", "what the problem was", "what you did", "and explain how it made you feel"] },
    { cue: "Describe a book or film that made you think deeply.", points: ["what it was", "when you read/watched it", "what it was about", "and explain why it made you think"] },
    { cue: "Describe an environmental problem in your country.", points: ["what the problem is", "what causes it", "how it affects people", "and explain what could be done"] },
    { cue: "Describe a goal you hope to achieve in the next five years.", points: ["what the goal is", "why it matters to you", "what you need to do", "and explain how you will feel if you achieve it"] },
    { cue: "Describe a time you were very busy.", points: ["when it was", "what you had to do", "how you managed your time", "and explain how you felt"] },
  ],
  part3: [
    "Why do some people find it hard to learn new skills as adults?", "Should governments pay for adult education?",
    "How has technology changed the way people relax?", "Do you think cities will become more or less crowded in the future?",
    "What qualities make someone a good role model?", "Is it better to have one career for life or change careers?",
    "Why do older people sometimes resist new technology?", "Should individuals or governments be responsible for protecting the environment?",
    "How does volunteering benefit society?", "Do people today have less free time than in the past?",
  ],
};

// Bảng quy đổi số câu đúng /40 → band (Academic Reading, xấp xỉ)
export function readingBand(correct, total) {
  const s = Math.round((correct / total) * 40);
  const t = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [0, 3.5]];
  return t.find(([min]) => s >= min)[1];
}
export function listeningBand(correct, total) {
  const s = Math.round((correct / total) * 40);
  const t = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [0, 3.5]];
  return t.find(([min]) => s >= min)[1];
}
export const roundBand = (x) => Math.round(x * 2) / 2;

// Reading General Training (thang 40 câu)
export function gtReadingBand(correct) {
  const t = [[40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6], [27, 5.5], [23, 5], [19, 4.5], [15, 4], [0, 3.5]];
  return t.find(([min]) => correct >= min)[1];
}

// ---------------- NGUỒN ĐỀ THẬT (chính thức) ----------------
// Đề do IELTS/IDP/British Council/Cambridge phát hành. App chỉ liên kết, không sao chép nội dung.
export const OFFICIAL = [
  {
    group: "Đề làm quen chính thức trên máy tính (IDP / IELTS) — định dạng y như thi thật, 40 câu",
    items: [
      { kind: "listening", name: "Listening — Familiarisation test (4 phần, 40 câu, ~30 phút)", url: "https://demo-ielts.inspera.com/player/?assessmentRunId=131012334&context=exam#/section/128121996/question/128121965/scorableItem/1", key: "https://assets.ctfassets.net/unrdeg6se4ke/3FAYhbYOQElb7L6r4Rv8DR/8331f2b5f2d50b7489b4c14affb75544/IELTS_familiarisation_test_Listening_answers.pdf" },
      { kind: "reading", name: "Reading Academic — Familiarisation test (3 passage, 40 câu, 60 phút)", url: "https://demo-ielts.inspera.com/player/?assessmentRunId=131013388&context=exam#/section/128121930/question/128121896/scorableItem/1", key: "https://assets.ctfassets.net/unrdeg6se4ke/2ggjbjdFDSU7xXTp7Eqxjp/ef3ce074fbb5d9e47db8ee4b3ad45cb0/IELTS_familiarisation_test_Reading_answers.pdf" },
      { kind: "writing", name: "Writing Academic — Familiarisation test (Task 1 + Task 2, 60 phút)", url: "https://demo-ielts.inspera.com/player/?assessmentRunId=131013741&context=exam#/section/128125100/question/128121843/scorableItem/1", key: null },
      { kind: "speaking", name: "Speaking Part 1 — bản ghi âm mẫu + transcript", url: "https://assets.ctfassets.net/unrdeg6se4ke/i05RGjkPNBP9BFtAJeDdI/8771c7f6ecd7b675e038f7885942c1d4/speakingsamplepart1recording.mp3", key: "https://assets.ctfassets.net/unrdeg6se4ke/2xGGVzn9Uqaw4D2zy3AKkG/ef2348814527d3c1d1273b2d8a1473c0/Free_practice_test_-_Speaking_-_Part_1_-_Prompt___Transcript_-_Global.pdf" },
    ],
  },
  {
    group: "Trang tổng hợp đề mẫu chính thức",
    items: [
      { kind: "all", name: "IDP — IELTS Academic practice test (tất cả kỹ năng)", url: "https://ielts.idp.com/prepare/ielts-academic-practice-test" },
      { kind: "all", name: "ielts.org — Sample test questions (Academic), có answer key PDF", url: "https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test" },
      { kind: "all", name: "British Council — Take IELTS: đề luyện miễn phí, IELTS Ready (mock test có chấm)", url: "https://takeielts.britishcouncil.org/take-ielts/prepare" },
    ],
  },
  {
    group: "Sách đề thi thật (nên mua — nguồn luyện chính cho mục tiêu 8.0)",
    items: [
      { kind: "book", name: "Cambridge IELTS 1–20 (Academic): mỗi cuốn 4 đề thi thật đã dùng, có đáp án và bài mẫu. Ưu tiên các cuốn mới nhất (15–20).", url: "https://www.cambridge.org/ielts" },
    ],
  },
];
