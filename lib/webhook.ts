import fetch from "node-fetch";

export async function sendWebhookNotification(url: string, data: any) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to send webhook notification");
    }
  } catch (error) {
    console.error("❌ Error sending webhook notification:", error);
  }
}
