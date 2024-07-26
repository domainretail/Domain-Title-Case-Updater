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
            browser.tabs.executeScript(tab.id, {
              code: `
                (function() {
                  const displayNameInput = document.querySelector('input.ux-text-entry-field#display-name');
                  if (!displayNameInput) {
                    return { status: 'error', message: 'Display name input not found.' };
                  }

                  console.log('Current display name:', displayNameInput.value);
                  displayNameInput.value = '${domain}';
                  console.log('Updated display name to:', displayNameInput.value);

                  const inputEvent = new Event('input', { bubbles: true });
                  displayNameInput.dispatchEvent(inputEvent);

                  const saveButton = document.querySelector('button.ux-button[data-eid="am.fos.domain_details.domain_settings_save_cta.click"]');
                  if (!saveButton) {
                    return { status: 'error', message: 'Save button not found.' };
                  }

                  console.log('Clicking save button');
                  saveButton.click();

                  return { status: 'success', message: 'Domain update initiated.' };
                })();
              `
            }, (results) => {
              if (browser.runtime.lastError) {
                console.error("Error executing script:", browser.runtime.lastError);
                resolve({ status: 'error', message: 'Error updating domain: ' + browser.runtime.lastError.message });
              } else {
                console.log(`Script execution result:`, results[0]);
                resolve(results[0]);
              }
              setTimeout(() => browser.tabs.remove(tab.id), 5000);
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