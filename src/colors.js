// Based on:
// https://rootloops.sh?sugar=8&colors=7&sogginess=5&flavor=2&fruit=9&milk=1
const colors = {
  black: {
    dark: "hsl(0, 0%, 10%)",
    light: "hsl(0, 0%, 73%)",
    lighter: "hsl(0, 0%, 90%)",
  },
  red: {
    dark: "hsl(7, 73%, 72%)",
    light: "hsl(7, 87%, 85%)",
    lighter: "hsl(7, 95%, 94%)",
  },
  green: {
    dark: "hsl(134, 43%, 60%)",
    light: "hsl(134, 53%, 73%)",
    lighter: "hsl(134, 70%, 90%)",
  },
  yellow: {
    dark: "hsl(44, 54%, 55%)",
    light: "hsl(44, 74%, 76%)",
    lighter: "hsl(44, 80%, 90%)",
  },
  blue: {
    dark: "hsl(225, 71%, 76%)",
    light: "hsl(225, 86%, 88%)",
    lighter: "hsl(225, 90%, 94%)",
  },
  magenta: {
    dark: "hsl(305, 54%, 71%)",
    light: "hsl(305, 68%, 85%)",
    lighter: "hsl(305, 96%, 95%)",
  },
  cyan: {
    dark: "hsl(188, 58%, 57%)",
    light: "hsl(188, 52%, 76%)",
    lighter: "hsl(188, 52%, 92%)",
  },
  white: {
    dark: "hsl(240, 6%, 87%)",
    light: "hsl(240, 6%, 94%)",
    lighter: "hsl(240, 6%, 98%)",
  },
  foreground: "#fff",
  background: "#000",
  border: "hsl(231, 17%, 16%)",
  cursor: "hsl(305, 84%, 68%)",
  selection: "hsla(305, 32%, 72%, 0.58)",
  tooltip_bg: "hsla(188, 6%, 37%, 0.90)",
  popover_bg: "hsla(188, 6%, 37%, 0.90)",
  bright: "hsl(134, 43%, 60%)",
  link_hover_bg: "hsl(305, 7%, 37%)",
  highlight_bg: "hsl(188, 15%, 22%)",
  input: "hsl(305, 92%, 95%)",
  input_form: "hsl(188, 52%, 76%)",
  primary: "hsl(188, 31%, 41%)",
  primary_light: "hsl(188, 40%, 62%)",
  secondary: "hsl(188, 12%, 38%)",
  bg: "hsl(188, 14%, 96%)",
  bg_translucent: "hsla(188, 12%, 84%, 0.95)",
  bg_alt: "hsl(44, 28%, 90%)",
  text: "hsl(188, 39%, 11%)",
  hover: "hsl(188, 12%, 84%)",
  hover_bg: "hsl(188, 7%, 94%)",
  hint: "hsl(188, 11%, 65%)",
  scrollbar: "hsl(188, 12%, 55%)",
  scrollbar_hover: "hsl(188, 12%, 38%)",
};

module.exports = colors;
