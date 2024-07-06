// import kaboom from "kaboom.js" is not needed when using vite.
import kaboom from "kaboom";

export const k = kaboom({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
});
