# Деплой RoboSite на сервер (robo.markovo-school.ru)

RoboSite едет на **тот же VPS, что и школьный сайт** (`193.107.232.81`,
Ubuntu, Apache), но полностью **отдельным** контуром — свой субдомен, свой
bare-репозиторий, своя папка, свой git-remote. Пуш робо-сайта никогда не
трогает `markovo-school.ru` и наоборот.

- **Субдомен:** `robo.markovo-school.ru` (бесплатный, отдельно покупать не
  нужно — это поддомен уже купленного `markovo-school.ru`).
- **Папка на сервере:** `/var/www/robo`
- **Bare-репо на сервере:** `/var/repo/robo-site.git`
- **Git-remote отсюда:** `production`

Сайт статический — весь контент (HTML/CSS/JS, PDF, даже `.exe`-лаунчер)
лежит прямо в git, поэтому деплой простой: хук раскладывает всё дерево
коммита в папку сайта. Отдельной заливки медиа не требуется.

---

## Разовая настройка (делается один раз)

### 1. DNS на reg.ru
В панели reg.ru → раздел DNS домена `markovo-school.ru` добавить запись
(рядом с уже существующими `@` и `www`):

```
A   robo   →   193.107.232.81
```

Через несколько минут (иногда до пары часов) `robo.markovo-school.ru`
начнёт резолвиться на сервер.

### 2. На сервере: bare-репо + хук
Зайти по SSH: `ssh root@193.107.232.81`

```bash
# bare-репозиторий для приёма пушей
git init --bare /var/repo/robo-site.git

# папка сайта
mkdir -p /var/www/robo
chown -R www-data:www-data /var/www/robo
```

Положить хук `deploy/post-receive` (эталон — в этом репозитории) в
`/var/repo/robo-site.git/hooks/post-receive` и сделать исполняемым:

```bash
# содержимое взять из deploy/post-receive этого репозитория
nano /var/repo/robo-site.git/hooks/post-receive
chmod +x /var/repo/robo-site.git/hooks/post-receive
```

### 3. На сервере: Apache-vhost
Создать `/etc/apache2/sites-available/robo.conf`:

```apache
<VirtualHost *:80>
    ServerName robo.markovo-school.ru
    DocumentRoot /var/www/robo

    <Directory /var/www/robo>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/robo-error.log
    CustomLog ${APACHE_LOG_DIR}/robo-access.log combined
</VirtualHost>
```

> ⚠️ **Важно:** vhost робо-сайта НЕ содержит `AddHandler ... .html`, который
> есть у школьного сайта. RoboSite статический — его `.html` должны отдаваться
> как файлы, а не гоняться через PHP. Не копируй сюда школьный `.htaccess`.

Включить и перезагрузить:

```bash
a2ensite robo.conf
apache2ctl configtest && systemctl reload apache2
```

### 4. SSL (после того как DNS уже резолвится)
```bash
certbot --apache -d robo.markovo-school.ru
```
Certbot сам добавит `:443`-vhost и редирект с http на https. Бесплатно.

### 5. Локально: добавить remote и запушить
В этом репозитории (`C:\project\RoboSite`):

```bash
git remote add production ssh://root@193.107.232.81/var/repo/robo-site.git
git push production main
```

SSH-ключ для доступа уже настроен (тот же, что для школьного пуша, — ключ
привязан к серверу, а не к репозиторию). Если пуш просит пароль — значит
ключа нет, добавить публичный ключ в `~/.ssh/authorized_keys` на сервере
(см. как это описано в NOTES школьного репозитория).

После пуша хук сам разложит сайт в `/var/www/robo` и в консоли появится
`✅ RoboSite задеплоен: …`.

---

## Рабочий процесс (каждый день)

- **В GitHub** (бэкап/история) — как обычно: `git push origin main`.
- **На сайт** — отдельным действием: `git push production main`.

Два push'а независимы. `origin` = GitHub, `production` = боевой сервер.
Как и у школы: коммит уходит в GitHub одним действием, деплой — другим.

> Если пользуешься VPN — **выключить перед `git push production`** (у
> школьного пуша та же оговорка: VPN через тот же сервер рвёт соединение).

---

## Изоляция от школьного сайта — почему не мешают

| Ресурс | Школа | RoboSite |
|---|---|---|
| Субдомен / домен | `markovo-school.ru` | `robo.markovo-school.ru` |
| Bare-репо | `/var/repo/markovo-site.git` | `/var/repo/robo-site.git` |
| Папка сайта | `/var/www/markovo-school` | `/var/www/robo` |
| Apache vhost | `markovo-school.conf` | `robo.conf` |
| git-remote | `production` (в MarkovoSite) | `production` (в RoboSite) |

Ничего общего, кроме физического сервера и IP. `git push production main`
из RoboSite пишет только в `robo-site.git` → раскладывает только в
`/var/www/robo`. Школьный сайт при этом не затрагивается ни на байт.

---

## На будущее — PHP-портал с логином учеников

Когда робо-сайт станет PHP-приложением с входом учеников и их прогрессией:

1. **Живые данные** (аккаунты, прогресс) будут редактироваться прямо на
   сервере — их нельзя затирать деплоем. В `deploy/post-receive` уже
   заготовлен комментарий: добавить туда `--exclude` для папки данных
   (`/data/`, `/uploads/` и т.п.), по образцу школьного хука.
2. **PHP на vhost.** Если понадобится PHP-FPM — раскомментировать/расширить
   `security.limit_extensions` в пуле FPM (см. NOTES школьного репозитория,
   п. про PHP), но только если робо тоже начнёт исполнять `.html`. Для
   чистых `.php` этого не требуется.
3. **Аутентификация учеников — отдельная от школьной админки.** Не
   переиспользовать `admin/private/users.json` школы: у неё другая
   аудитория (сотрудники-редакторы) и юридически регулируемый контент.
   Портал учеников — своя таблица пользователей, свой вход.

---

## Мелкая уборка перед первым деплоем (по желанию)

В корне репозитория лежит `Sensei Cat Design System-handoff.zip` (~8 МБ) —
он попадёт в веб-корень и станет публично скачиваемым по адресу
`robo.markovo-school.ru/Sensei%20Cat%20Design%20System-handoff.zip`. Если
это не задумано — удалить из репо или добавить в `.gitignore`.