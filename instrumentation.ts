declare global {
  // eslint-disable-next-line no-var
  var __didImportOnStartup: boolean | undefined;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (!globalThis.__didImportOnStartup) {
      globalThis.__didImportOnStartup = true;

      const rustApi =
        process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";
      const importSecret = process.env.IMPORT_SECRET || "";
      const headers = { "X-Import-Secret": importSecret };

      fetch(`${rustApi}/import/mdx`, { method: "POST", headers })
        .then(async (res) => {
          const data = await res.json();
          console.log("[import-mdx] result:", data);
        })
        .catch((e) => console.error("[import-mdx] failed:", e));

      fetch(`${rustApi}/import/json?from=250324`, { method: "POST", headers })
        .then(async (res) => {
          const data = await res.json();
          console.log("[import-json] job started:", data);
        })
        .catch((e) => console.error("[import-json] failed:", e));
    }
  }
}
