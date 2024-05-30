chrome.runtime.sendMessage({
  action: "listImages",
  data: Array.from(document.images).map(img => img.src)
});