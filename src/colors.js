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
  tooltip: "hsla(60, 9%, 49%, 0.952)",
};

module.exports = colors;
