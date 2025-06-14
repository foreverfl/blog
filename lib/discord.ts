interface SendDiscordParams {
  type: string;
  payload?: Record<string, any>;
}

export async function sendDiscord({ type, payload = {} }: SendDiscordParams) {
  return fetch("/api/discord/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      ...payload,
    }),
  });
}
