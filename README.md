# sokolovastartup

Telegram mini app for StartUp Academy: a 3-minute quiz and the bot that opens it.

The bot token stays in `.env` on the machine that runs the app. That file is not in git.

```
TELEGRAM_BOT_TOKEN=
PORT=3080
WEBAPP_URL=
```

`WEBAPP_URL` is the public https address of this process. Telegram uses it for the **Погнали** button and the menu button **Открыть приложение**.

```bash
npm ci
npm run build
npm start
```

On the Ubuntu server, after the build:

```bash
pm2 start ecosystem.config.cjs
```
