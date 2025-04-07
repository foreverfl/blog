export function getTodayKST(): string {
  const now = new Date();
  now.setHours(now.getHours() + 9); // Adjust to KST (UTC+9)
  return now.toISOString().slice(2, 10).replace(/-/g, "");
}
