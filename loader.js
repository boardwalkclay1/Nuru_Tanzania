// loader.js
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  // Safety delay ensures animation plays but never gets stuck
  setTimeout(() => {
    if (loader) {
      loader.classList.add("hidden");
    }
  }, 300);
});
