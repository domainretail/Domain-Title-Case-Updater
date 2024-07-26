// background.js
var browser = browser || chrome;

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({ url: "interface.html" });
});

async function updateDomain(domain) {
  return new Promise((resolve) => {
    console.log(`Creating tab for domain: ${domain}`);
    browser.tabs.create({ url: `https://www.afternic.com/domains/${domain}/details?view=settings`, active: false }, (tab) => {
      console.log(`Tab created with id: ${tab.id}`);
      browser.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          console.log(`Tab ${tabId} loaded completely`);
          setTimeout(() => {
            console.log(`Attempting to send message to tab ${tabId}`);
            browser.tabs.sendMessage(tab.id, { action: 'updateDomain', domain }, (response) => {
              if (browser.runtime.lastError) {
                console.error("Error sending message:", browser.runtime.lastError);
                resolve({ status: 'error', message: 'Error communicating with the page: ' + browser.runtime.lastError.message });
              } else {
                console.log(`Received response from tab ${tabId}:`, response);
                resolve(response);
              }
              browser.tabs.remove(tab.id);
            });
          }, 2000);
          browser.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background script:", message);
  if (message.action === 'updateDomain') {
    updateDomain(message.domain)
      .then(sendResponse)
      .catch(error => {
        console.error("Error in updateDomain:", error);
        sendResponse({ status: 'error', message: 'Unexpected error in background script' });
      });
    return true;
  }
});