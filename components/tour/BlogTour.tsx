"use client";

import BlogTourTooltip from "@/components/tour/BlogTourTooltip";
import { blogTourSteps } from "@/components/tour/steps";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Joyride from "react-joyride";

export default function BlogTour() {
  const [run, setRun] = useState(false);
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
    const requiredSelectors = [
      "#menu-button",
      "#language-select-desktop",
      "#theme-toggle-desktop",
      "#profile-button",
      "main",
    ];

    function isVisible(element: Element | null) {
      if (!element) return false;
      let parent: Element | null = element;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        ) {
          console.log("paraent or selt is not visible", parent);
          return false;
        }
        parent = parent.parentElement;
      }
      return true;
    }

    const timeout = setTimeout(() => {
      const results = requiredSelectors.map((selector) => {
        const el = document.querySelector(selector);
        const visible = isVisible(el);
        if (!visible) {
          console.log(`selector ${selector} is not visible`);
        }
        return visible;
      });

      const allVisible = results.every(Boolean);

      if (allVisible) {
        setRun(true);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

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
      debug={true}
    />
  );
}
