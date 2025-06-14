export function getTodayKST(): string {
  const now = new Date();
  now.setHours(now.getHours() + 9); // Adjust to KST (UTC+9)
  return now.toISOString().slice(2, 10).replace(/-/g, "");
}

export function getCurrentTimeKST(): string {
  // Get current time in UTC
  const now = new Date();

  // Convert to KST (UTC+9)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  // Format: [YYYY-MM-DD HH:mm:ss]
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  const hh = String(kst.getUTCHours()).padStart(2, "0");
  const mi = String(kst.getUTCMinutes()).padStart(2, "0");
  const ss = String(kst.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
