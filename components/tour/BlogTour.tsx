"use client";

import BlogTourTooltip from "@/components/tour/BlogTourTooltip";
import { blogTourSteps } from "@/components/tour/steps";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Joyride from "react-joyride";

export default function BlogTour() {
  const [run, setRun] = useState(false);
  const [checked, setChecked] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const translatedSteps = useMemo(() => {
    return blogTourSteps.map((step) => ({
      ...step,
      content:
        typeof step.content === "string" ? t(step.content) : step.content,
    }));
  }, [t]);

  useEffect(() => {
    FingerprintJS.load().then((fp) => {
      fp.get().then(async (result) => {
        const fingerprint = result.visitorId;

        const res = await fetch(`/api/visitor/${fingerprint}`);
        const data = await res.json();

        if (!data.ok || !data.found) {
          setRun(true);
        } else if (
          data.data &&
          !data.data.is_bot &&
          data.data.visit_count === 1
        ) {
          setRun(true);
        } else {
          setRun(false);
        }
        setChecked(true);
      });
    });
  }, [setRun]);

  return (
    <Joyride
      steps={translatedSteps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      floaterProps={{
        hideArrow: false,
      }}
      tooltipComponent={BlogTourTooltip}
      styles={{
        overlay: {
          backgroundColor:
            theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.4)",
        },
      }}
    />
  );
}
