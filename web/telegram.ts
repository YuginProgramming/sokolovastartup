type TelegramUser = {
  first_name?: string;
};

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  openLink?: (url: string) => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  initDataUnsafe?: { user?: TelegramUser };
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function prepareTelegram(): void {
  const app = window.Telegram?.WebApp;
  app?.ready();
  app?.expand();
  app?.setHeaderColor?.("#191a1c");
  app?.setBackgroundColor?.("#191a1c");
}

export function telegramFirstName(): string {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name?.trim() || "";
}

export function openOutside(url: string): void {
  const app = window.Telegram?.WebApp;
  if (app?.openLink) {
    app.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener");
}
