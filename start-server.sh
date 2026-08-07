#!/usr/bin/env bash
# Аналог start-server.bat для Linux/macOS/Git Bash: статический сервер
# для локальной проверки (нужен из-за fetch() partials/header.html и
# partials/footer.html -- под file:// они не подгрузятся из-за CORS).

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo
echo " ========================================================="
echo "  http://localhost:8080/"
echo "  Ctrl+C -- остановить сервер"
echo " ========================================================="
echo

cd "$ROOT"
exec php -S localhost:8080
