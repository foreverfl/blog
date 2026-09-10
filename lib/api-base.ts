// The one place the backend addresses come from; every fetch builds on these.
export const RUST_API =
  import.meta.env.PUBLIC_API_RUST_URL || "http://localhost:8002";

export const API_AUTH_URL =
  import.meta.env.PUBLIC_API_AUTH_URL || "http://localhost:8001/auth";
