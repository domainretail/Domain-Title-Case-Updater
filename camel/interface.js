// interface.js
var browser = browser || chrome;

let domains = [];
let currentIndex = 0;
let isAutomatic = false;

document.addEventListener('DOMContentLoaded', function() {
    const domainsTextarea = document.getElementById('domains');
    const fileInput = document.getElementById('fileInput');
    const startAutomatic = document.getElementById('startAutomatic');
    const startManual = document.getElementById('startManual');
    const processNext = document.getElementById('processNext');
    const delayInput = document.getElementById('delay');
    const statusDiv = document.getElementById('status');
    const logDiv = document.getElementById('log');

    function log(message) {
        const logEntry = document.createElement('div');
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        logDiv.appendChild(logEntry);
        logDiv.scrollTop = logDiv.scrollHeight;
        console.log(message);
    }

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                domainsTextarea.value = event.target.result;
                log(`Loaded ${domainsTextarea.value.split('\n').filter(d => d.trim() !== '').length} domains from file`);
            };
            reader.readAsText(file);
        }
    });

    startAutomatic.addEventListener('click', function() {
        domains = domainsTextarea.value.split('\n').filter(d => d.trim() !== '');
        isAutomatic = true;
        currentIndex = 0;
        processNext.disabled = true;
        log('Started automatic processing');
        processNextDomain();
    });

    startManual.addEventListener('click', function() {
        domains = domainsTextarea.value.split('\n').filter(d => d.trim() !== '');
        isAutomatic = false;
        currentIndex = 0;
        processNext.disabled = false;
        log('Started manual processing');
    });

    processNext.addEventListener('click', processNextDomain);

    function processNextDomain() {
        if (currentIndex < domains.length) {
            const domain = domains[currentIndex].trim();
            statusDiv.textContent = `Processing ${domain} (${currentIndex + 1}/${domains.length})`;
            log(`Processing domain: ${domain}`);
            
            browser.runtime.sendMessage({ action: 'updateDomain', domain: domain }, function(response) {
                log(`Result for ${domain}: ${JSON.stringify(response)}`);
                currentIndex++;
                
                if (isAutomatic && currentIndex < domains.length) {
                    setTimeout(processNextDomain, parseInt(delayInput.value));
                } else if (currentIndex >= domains.length) {
                    statusDiv.textContent = 'All domains processed';
                    log('All domains processed');
                    processNext.disabled = true;
                } else {
                    processNext.disabled = false;
                }
            });
        }
    }
});