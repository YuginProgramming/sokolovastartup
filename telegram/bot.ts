import { Markup, Telegraf } from "telegraf";

const startText = [
  "Работаешь в найме и не понимаешь, как выйти в онлайн.",
  "",
  "Тест за 3 минуты покажет твой формат старта, 5 услуг под тебя и план первых 7 дней.",
].join("\n");

export function launchBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const webAppUrl = process.env.WEBAPP_URL?.trim();

  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN is empty. The site is up, the bot is off.");
    return;
  }

  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!webAppUrl) {
      await ctx.reply(`${startText}\n\nСсылка на приложение ещё не задана. Добавь WEBAPP_URL в .env.`);
      return;
    }
    await ctx.reply(startText, Markup.inlineKeyboard([Markup.button.webApp("Погнали", webAppUrl)]));
  });

  void startPolling(bot, webAppUrl);

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

async function startPolling(bot: Telegraf, webAppUrl: string | undefined): Promise<void> {
  try {
    if (webAppUrl) {
      await bot.telegram.setChatMenuButton({
        menuButton: {
          type: "web_app",
          text: "Открыть приложение",
          web_app: { url: webAppUrl },
        },
      });
    } else {
      console.log("WEBAPP_URL is empty. The menu button will appear after you set it.");
    }
    console.log("Telegram bot is polling");
    await bot.launch();
  } catch (error) {
    console.error("Telegram bot failed to start:", error);
  }
}
