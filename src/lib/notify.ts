export async function notifyOwner(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_TO, from = process.env.NOTIFY_FROM;
  if (!key || !to || !from) {
    console.log("[notify]", subject, "\n" + text);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
  } catch (e) {
    console.error("[notify] failed", e);
  }
}
