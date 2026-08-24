# timeblock

A day is a column. You place time into it, then you spend time against it.

Single component, `timeblock.jsx`. Everything else here exists to get that
component onto a phone.

## Build

```sh
npm install     # once
npm run build   # writes dist/
```

`dist/` is five files: `index.html` (the shell with the whole bundle inlined),
`sw.js`, `manifest.webmanifest`, and two icons. Nothing is fetched from a CDN
except the Archivo webfont, which the service worker caches after the first run.

## Deploy

```sh
./deploy.sh
```

Installs if needed, builds, rsyncs to `simulacra:/var/www/boil.someodd.zip/`.
The target is the first line of the script, or `DEPLOY_TARGET` in the
environment.

No `--delete`. The old `boil.html` costs nothing to leave lying at
`/boil.html`, and it is the only thing that can still read the old app's
`localStorage`, which is on the same origin and untouched by this one.

## nginx

Live at `https://boil.someodd.zip:8888/`. Four changes to the block that was
already serving boil:

```nginx
server {
    listen 8765;
    listen 8888 ssl;
    server_name boil.someodd.zip;
    root /var/www/boil.someodd.zip;

    ssl_certificate /etc/letsencrypt/live/boil.someodd.zip/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boil.someodd.zip/privkey.pem;

    index index.html;                         # was boil.html

    location / {
        try_files $uri $uri/ /index.html;     # was /boil.html
    }

    # the shell is the whole app, so it is the one file that must never come
    # back stale, or a deploy can never reach a phone that already has one
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /sw.js {
        expires off;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location = /manifest.webmanifest {        # was manifest.json
        add_header Cache-Control "no-cache";
        default_type application/manifest+json;
    }

    gzip on;                                  # was commented out
    gzip_types application/manifest+json;     # text/html is implicit
    gzip_comp_level 5;
    gzip_min_length 1024;
}
```

Do not uncomment the HSTS header. It is scoped to the host, not the port, so it
would upgrade `http://boil.someodd.zip:8765` to https and there is no TLS
listener there. The other three commented headers are harmless.

Port 8765 is not a secure context, so on that port there is no service worker:
no notifications, no install, no offline. Use 8888.

## The service worker

Three jobs, all of them load bearing on Android:

1. **Notifications.** Chrome on Android throws on `new Notification()`. A
   reminder can only come from `registration.showNotification()`. Without
   `sw.js` the reminders switch in settings is wired to nothing.
2. **Install.** Chrome wants a registered worker with a fetch handler before it
   will offer "add to home screen".
3. **Offline.** Stale while revalidate: the app opens instantly from cache and
   fetches a new build in the background, so a deploy lands the *second* time
   the app is opened, not the first.

It holds no app state and schedules nothing. State lives in `localStorage` under
`timeblock:v6:state`, with a rolling copy at `timeblock:v6:backup`.
