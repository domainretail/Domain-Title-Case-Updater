// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFile');
    const fileContent = document.getElementById('fileContent');
    const startAutomatic = document.getElementById('startAutomatic');
    const startManual = document.getElementById('startManual');
    const delayInput = document.getElementById('delay');
  
    let domains = [];
  
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          domains = event.target.result.split('\n').filter(domain => domain.trim() !== '');
          fileContent.textContent = `Loaded ${domains.length} domains`;
          startAutomatic.disabled = false;
          startManual.disabled = false;
        };
        reader.readAsText(file);
      }
    });
  
    startAutomatic.addEventListener('click', function() {
      const delay = delayInput.value;
      browser.runtime.sendMessage({
        action: 'startAutomatic',
        domains: domains,
        delay: delay
      });
    });
  
    startManual.addEventListener('click', function() {
      browser.runtime.sendMessage({
        action: 'startManual',
        domains: domains
      });
    });
  
    // Disable buttons initially
    startAutomatic.disabled = true;
    startManual.disabled = true;
  });