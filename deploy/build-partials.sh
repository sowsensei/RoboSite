#!/bin/bash
# ─── Вклейка шапки и футера в страницы (запускается при деплое) ───────────
#
# Что делает: в каждой .html-странице заменяет плейсхолдеры
#   <div id="site-header"></div>   → содержимое partials/header.html
#   <div id="site-footer"></div>   → содержимое partials/footer.html
#
# Зачем, если их и так подставляет js/main.js: JS вклеивает шапку и футер уже
# в браузере, поэтому в исходном HTML их нет — а поисковику нужен именно
# исходный HTML. Больше всего это важно для ссылки «Дата-центр itsoft» в
# футере: она обязана быть индексируемой по условиям бесплатного хостинга.
# Заодно роботу становятся видны ссылки меню, а страница не «прыгает» без
# шапки первые миллисекунды.
#
# js/main.js при этом НЕ трогаем — он остаётся страховкой: его include()
# ничего не делает, если плейсхолдера в DOM уже нет. То есть если эта сборка
# по какой-то причине не отработает, сайт просто продолжит работать по-старому,
# на JS. Поэтому скрипт и не роняет деплой из-за отдельной кривой страницы.
#
# Пути внутри partials/*.html абсолютные (/assets/…, /lessons/…), поэтому
# ничего пересчитывать под вложенность страницы не нужно.
#
# Запускается автоматически из deploy/post-receive. Локально (посмотреть, что
# получится) — bash deploy/build-partials.sh . — но коммитить результат не надо.
#
# Из зависимостей только bash + find/awk, которые на сервере есть всегда.
set -e

ROOT="${1:-.}"
HEADER="$ROOT/partials/header.html"
FOOTER="$ROOT/partials/footer.html"

for f in "$HEADER" "$FOOTER"; do
  if [ ! -f "$f" ]; then
    echo "❌ Не найден партиал: $f" >&2
    exit 1
  fi
done

pages=0
warned=0

while IFS= read -r page; do
  rel="${page#$ROOT/}"

  has_header=0; grep -q '<div id="site-header"></div>' "$page" && has_header=1
  has_footer=0; grep -q '<div id="site-footer"></div>' "$page" && has_footer=1

  if [ "$has_header" -eq 0 ] || [ "$has_footer" -eq 0 ]; then
    # Не повод валить деплой: страница просто уедет как есть. Но если это не
    # задумано — в футере такой страницы не будет обязательной ссылки на
    # дата-центр itsoft, поэтому предупреждаем в логе пуша.
    missing=""
    [ "$has_header" -eq 0 ] && missing="шапки"
    [ "$has_footer" -eq 0 ] && missing="${missing:+$missing и }футера"
    echo "⚠️  $rel — нет плейсхолдера $missing" >&2
    warned=$((warned + 1))
  fi

  awk -v header="$HEADER" -v footer="$FOOTER" '
    /<div id="site-header"><\/div>/ {
      while ((getline line < header) > 0) print line
      close(header)
      next
    }
    /<div id="site-footer"><\/div>/ {
      while ((getline line < footer) > 0) print line
      close(footer)
      next
    }
    { print }
  ' "$page" > "$page.tmp"

  mv "$page.tmp" "$page"
  pages=$((pages + 1))
done < <(find "$ROOT" -name '*.html' -not -path '*/.git/*' -not -path "$ROOT/partials/*" | sort)

echo "🧩 Шапка и футер вклеены: $pages страниц (предупреждений: $warned)"
