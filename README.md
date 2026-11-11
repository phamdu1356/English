# IELTS 8.0 Coach

Hệ thống tự học IELTS chạy trên máy (local), lộ trình 12 tuần × ~2.5 giờ/ngày, có giáo viên AI (Claude) chấm bài và tạo đề.

## Tính năng

| Module | Học thế nào |
|---|---|
| **Hôm nay** | Checklist nhiệm vụ theo ngày/tuần của lộ trình, streak, band ước tính từng kỹ năng |
| **Test đầu vào** | 20 câu ngữ pháp–từ vựng, 1 bài Reading, 1 bài Writing (AI chấm) → band hiện tại và khoảng cách tới 8.0 |
| **Lộ trình 12 tuần** | 3 giai đoạn: Nền tảng → Tăng tốc → Về đích; trọng tâm từng tuần |
| **Từ vựng SRS** | ~100 từ học thuật + từ của bạn; thẻ ghi nhớ (thuật toán SM-2), gõ từ chủ động, nghe phát âm |
| **Reading** | AI soạn passage gốc + 10 câu (TFNG, MCQ, completion), bấm giờ, chấm & giải thích, quy đổi band |
| **Listening** | AI soạn script Section 1–4, trình duyệt đọc to bằng 2 giọng, điền đáp án, xem lại script |
| **Writing** | Task 1/Task 2, bấm giờ, đếm từ, tự lưu nháp; AI chấm 4 tiêu chí + lỗi + bản viết lại band 8 |
| **Speaking** | Part 1/2/3, đồng hồ chuẩn bị/nói, ghi âm nghe lại, tự chép lời; AI chấm 3 tiêu chí + câu mẫu |
| **Giáo viên AI** | 5 chế độ: gia sư, giám khảo Speaking, sửa câu, luyện phản xạ dịch, tranh luận |
| **Sổ lỗi sai** | Mọi lỗi AI tìm được tự động vào sổ; ôn kiểu che đáp án |
| **Tiến độ** | Biểu đồ band theo thời gian, sao lưu/khôi phục |

## Cài đặt & chạy

Cần Node.js 20+.

```bash
npm install
export ANTHROPIC_API_KEY="sk-ant-..."   # lấy tại https://console.anthropic.com
npm start
```

Mở http://localhost:5173 (nên dùng Chrome/Edge để có ghi âm, chép lời và đọc văn bản).

### Icon bấm để mở (Linux)

```bash
./install-icon.sh
```

Tạo lối tắt **IELTS 8.0 Coach** trong menu ứng dụng và trên Desktop. Bấm vào: máy chủ tự khởi động (nếu chưa chạy) và trình duyệt mở app. Để icon dùng được giáo viên AI, tạo file `.env` cạnh `server.js`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Không có API key ứng dụng vẫn chạy: lộ trình, test trắc nghiệm, từ vựng SRS, đồng hồ, ghi âm và sổ lỗi đều dùng được; chỉ phần chấm bài và tạo đề cần AI.

## Ghi chú

- Model: `claude-opus-5-5`. Bật sẵn cơ chế dự phòng phía máy chủ (`fallbacks: "default"`): nếu một yêu cầu bị bộ lọc an toàn từ chối, API tự chạy lại trên model khác.
- Chi phí ước tính: mỗi lần chấm Writing/tạo đề khoảng vài nghìn token (~0,05–0,15 USD).
- Dữ liệu tiến độ lưu ở `data/progress.json` (không đưa lên git).
- Đề và nội dung đều tự soạn hoặc do AI tạo mới, không sao chép đề thi thật. Nên luyện thêm bằng bộ Cambridge IELTS chính thức.
- Band quy đổi từ bài ngắn chỉ mang tính tham khảo.
