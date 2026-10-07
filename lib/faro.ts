import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import { API_AUTH_URL, RUST_API } from "@/lib/api-base";

// No collector url, no telemetry: local dev stays quiet unless .env.local names one.
const collectorUrl = import.meta.env.PUBLIC_FARO_COLLECTOR_URL;

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
      new TracingInstrumentation({
        instrumentationOptions: {
          propagateTraceHeaderCorsUrls: [
            new RegExp(RUST_API),
            new RegExp(API_AUTH_URL),
          ],
        },
      }),
    ],
  });
}
