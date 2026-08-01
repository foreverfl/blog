import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

// localhost fallback is dev-only: leaking it into a prod build would make
// every visitor's browser POST telemetry to their own machine
const collectorUrl =
  import.meta.env.PUBLIC_FARO_COLLECTOR_URL ||
  (import.meta.env.DEV ? "http://localhost:12347/collect" : "");

if (collectorUrl) {
  initializeFaro({
    url: collectorUrl,
    app: {
      name: "blog-front",
      environment: import.meta.env.DEV ? "local" : "production",
    },
    // Explicit instrumentations replace the default set: keep the defaults and
    // add tracing (fetch/xhr + page load spans)
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation(),
    ],
  });
}
