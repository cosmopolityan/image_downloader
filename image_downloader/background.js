chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.action == "downloadImages") {
          downloadImages(request.images);
          sendResponse({status: "Images download initiated"});
      }
  }
);

function downloadImages(imageUrls) {
  imageUrls.forEach(url => {
      chrome.downloads.download({
          url: url
      }, downloadId => {
          if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
          } else {
              console.log(`Image download initiated with ID: ${downloadId}`);
          }
      });
  });
}