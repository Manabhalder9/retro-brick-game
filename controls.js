(() => {
  "use strict";
  const settingsDialog = document.querySelector("#settings-dialog");
  const consoleColor = document.querySelector("#console-color");
  const buttonColor = document.querySelector("#button-color");
  const powerButton = document.querySelector('[data-action="power"]');
  const savedConsoleColor = localStorage.getItem("brick-console-color") || "#1763a5";
  const savedButtonColor = localStorage.getItem("brick-button-color") || "#f4c63f";
  const setThemeVariable = (variable, value) => document.documentElement.style.setProperty(variable, value);
  function openSettings() { if (typeof settingsDialog.showModal === "function") settingsDialog.showModal(); else settingsDialog.setAttribute("open", ""); }
  document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("pointerdown", event => { event.preventDefault(); const action = button.dataset.action; if (action === "power") BrickGame.power(); if (action === "sound") BrickGame.sound(); if (action === "pause") BrickGame.pause(); if (action === "reset") BrickGame.reset(); if (action === "left") BrickGame.left(); if (action === "right") BrickGame.right(); if (action === "soft-drop") BrickGame.softDrop(); if (action === "hard-drop") BrickGame.hardDrop(); if (action === "rotate") BrickGame.rotate(); }));
  let powerPressTimer;
  powerButton.addEventListener("pointerdown", () => { powerPressTimer = setTimeout(openSettings, 700); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(name => powerButton.addEventListener(name, () => clearTimeout(powerPressTimer)));
  document.addEventListener("keydown", event => { const actions = { ArrowLeft: BrickGame.left, ArrowRight: BrickGame.right, ArrowDown: BrickGame.softDrop, ArrowUp: BrickGame.rotate, " ": BrickGame.hardDrop, Enter: BrickGame.pause, Escape: BrickGame.pause }; if (actions[event.key]) { event.preventDefault(); actions[event.key](); } if (event.key.toLowerCase() === "r") BrickGame.reset(); });
  consoleColor.addEventListener("input", event => { setThemeVariable("--console-bg", event.target.value); localStorage.setItem("brick-console-color", event.target.value); });
  buttonColor.addEventListener("input", event => { setThemeVariable("--button-bg", event.target.value); localStorage.setItem("brick-button-color", event.target.value); });
  document.addEventListener("dblclick", event => { if (event.target === powerButton) openSettings(); });
  setThemeVariable("--console-bg", savedConsoleColor); setThemeVariable("--button-bg", savedButtonColor); consoleColor.value = savedConsoleColor; buttonColor.value = savedButtonColor;
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
})();
