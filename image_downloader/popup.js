document.getElementById('downloadBtn').addEventListener('click', downloadSelectedImages);

document.getElementById('selectAll').addEventListener('change', function (e) {
  const checkedStatus = e.target.checked;
  const checkboxes = document.querySelectorAll('#imagesContainer input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = checkedStatus;
  });
});

function listImages() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['contentScript.js']
    });
  });
}

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action == "listImages") {
    const container = document.getElementById('imagesContainer');
    container.innerHTML = '';
    request.data.forEach((url) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('image-wrapper');
      const checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      checkBox.value = url;
      const imgElement = document.createElement('img');
      imgElement.src = url;
      imgElement.style.width = '100px';
      wrapper.appendChild(checkBox);
      wrapper.appendChild(imgElement);
      container.appendChild(wrapper);
    });
  }
});

listImages();

function findImagesOnPage() {
  const images = document.querySelectorAll('img');
  return Array.from(images).map(img => img.src);
}

function displayImages(imageUrls) {
  const container = document.getElementById('imagesContainer');
  container.innerHTML = '';
  imageUrls.forEach((url) => {
    const wrapper = document.createElement('div');
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.value = url;
    const imgElement = document.createElement('img');
    imgElement.src = url;
    imgElement.style.width = '100px';
    wrapper.appendChild(checkBox);
    wrapper.appendChild(imgElement);
    container.appendChild(wrapper);
  });
}

function downloadSelectedImages() {
  const checkedImages = document.querySelectorAll('#imagesContainer input[type="checkbox"]:checked');
  if (checkedImages.length >= 2) {
    const zip = new JSZip();
    let count = 0;
    let urlParts;
    let archiveName;

    urlParts = checkedImages[0].value.split('/');
    archiveName = `images_from_${urlParts[2]}`;
    for (let i = 0; i < urlParts.length; i++) {
      if (urlParts[i] === '') {
        urlParts.splice(i, 1);
        i--;
      }
    }

    checkedImages.forEach(img => {
      const url = img.value;
    
      let filename = url.split('/').pop();
      filename = decodeURIComponent(filename);
      const queryIndex = filename.indexOf('?');
      if (queryIndex !== -1) {
        filename = filename.slice(0, queryIndex);
      }
      const lastSlashIndex = filename.lastIndexOf('url=');
      if (lastSlashIndex !== -1) {
        filename = filename.slice(lastSlashIndex + 4);
      }
    
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          zip.file(filename, blob);
          count++;
          if (count === checkedImages.length) {
            zip.generateAsync({ type: "blob" }).then(function (content) {
              saveAs(content, `${archiveName}.zip`);
            });
          }
        });
    });
  } else if (checkedImages.length === 1) {
    chrome.downloads.download({
      url: checkedImages[0].value
    });
  }
}

listImages();