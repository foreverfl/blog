import { useEffect, useRef } from "react";

interface CloudflareTurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  resetDeps?: any[]; // reset dependencies to re-render the widget
}

const CloudflareTurnstile = ({
  siteKey,
  onSuccess,
  resetDeps = [],
}: CloudflareTurnstileProps) => {
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const widgetEl = widgetRef.current;

    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.id = "cf-turnstile-script";
      document.body.appendChild(script);
    }

    // mount the widget
    const renderWidget = () => {
      if (
        window.turnstile &&
        widgetRef.current &&
        widgetRef.current.children.length === 0
      ) {
        window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          callback: onSuccess,
        });
      }
    };

    // wait for the turnstile script to load
    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // cleanup when component unmounts
    return () => {
      if (window.turnstile && widgetEl) {
        try {
          window.turnstile.remove(widgetEl);
        } catch {}
      }
    };
  }, [onSuccess, siteKey, resetDeps]);

  return <div ref={widgetRef} />;
};

export default CloudflareTurnstile;
