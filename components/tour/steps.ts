import { Step } from "react-joyride";

export const blogTourSteps: Step[] = [
  {
    target: "#menu-button",
    content: "tour_menu",
    disableBeacon: true,
    showSkipButton: false,
  },
  {
    target: "#language-select-desktop",
    content: "tour_language",
    disableBeacon: true,
    showSkipButton: false,
  },
  {
    target: "#theme-toggle-desktop",
    content: "tour_theme",
    disableBeacon: true,
    showSkipButton: false,
  },

  {
    target: "#profile-button",
    content: "tour_profile",
    disableBeacon: true,
    showSkipButton: false,
  },
  {
    target: "main",
    content: "tour_scroll",
    placement: "top",
    disableBeacon: true,
    showSkipButton: false,
  },
];
