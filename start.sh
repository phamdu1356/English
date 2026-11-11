#!/usr/bin/env bash
# Mở IELTS 8.0 Coach: khởi động máy chủ nếu chưa chạy, rồi mở trình duyệt.
cd "$(dirname "$(readlink -f "$0")")" || exit 1
PORT="${PORT:-5173}"
URL="http://localhost:$PORT"

if ! curl -fs "$URL/api/status" >/dev/null 2>&1; then
  [ -d node_modules ] || npm install --silent
  mkdir -p data
  # API key đặt trong file .env (ANTHROPIC_API_KEY=sk-ant-...) — không đưa lên git
  nohup node --env-file-if-exists=.env server.js >data/server.log 2>&1 &
  for _ in $(seq 1 50); do
    curl -fs "$URL/api/status" >/dev/null 2>&1 && break
    sleep 0.2
  done
fi

if curl -fs "$URL/api/status" >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 &
else
  command -v notify-send >/dev/null && notify-send "IELTS 8.0 Coach" "Không khởi động được máy chủ. Xem data/server.log"
  exit 1
fi
