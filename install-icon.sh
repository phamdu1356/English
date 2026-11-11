#!/usr/bin/env bash
# Tạo lối tắt "IELTS 8.0 Coach" trong menu ứng dụng và trên Desktop (Linux).
set -e
DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
chmod +x "$DIR/start.sh"
APPS="$HOME/.local/share/applications"
mkdir -p "$APPS"
FILE="$APPS/ielts-8-coach.desktop"
cat >"$FILE" <<EOF
[Desktop Entry]
Type=Application
Name=IELTS 8.0 Coach
Comment=Hệ thống tự học IELTS mục tiêu 8.0
Exec="$DIR/start.sh"
Icon=$DIR/public/icon.svg
Terminal=false
Categories=Education;
EOF
chmod +x "$FILE"
update-desktop-database "$APPS" >/dev/null 2>&1 || true

DESK="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
if [ -d "$DESK" ]; then
  cp "$FILE" "$DESK/"
  chmod +x "$DESK/ielts-8-coach.desktop"
  gio set "$DESK/ielts-8-coach.desktop" metadata::trusted true 2>/dev/null || true
fi
echo "Đã tạo lối tắt: menu ứng dụng + $DESK"
