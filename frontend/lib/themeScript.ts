// Runs in <head> before the first paint, so there is no flash of the wrong theme.
// The IST rule is repeated here in plain JavaScript. Keep it in sync with lib/theme.ts.
export const themeInitScript = `
(function () {
  try {
    var pref = localStorage.getItem("watchwave-theme");
    if (pref !== "light" && pref !== "dark") pref = "auto";
    var theme = pref;
    if (pref === "auto") {
      var hour = Number(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hourCycle: "h23"
        }).format(new Date())
      );
      theme = hour >= 5 && hour < 12 ? "light" : "dark";
    }
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;
