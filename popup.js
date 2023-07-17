// The button is disabled by default
const connectBtn = document.getElementById('connect-btn');

console.log('popup.js loaded', new Date().toLocaleTimeString() + '.' + new Date().getMilliseconds());

// If we're at the chatgpt webpage then enable the button
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  if (tabs[0].url.includes('https://chat.openai.com')) {
    connectBtn.disabled = false; // Enable the button
    tabId = tabs[0].id; // Set the tab id
  } else {
    // Reflect any previous state (if the popup was reopened)
    chrome.runtime.sendMessage({action: 'getStatus'}, response => {
      connected = response.connected;
      updateButton(connected);
    });
  }
});

// When the button is clicked try to connect to the server
connectBtn.addEventListener('click', () => {
  // Update the UI
  updateButton('connecting');

  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    console.log('tab id:', tabs[0].id);

    chrome.tabs.sendMessage(tabs[0].id, {action: 'connect'}, (success) => {
      // Update the UI
      console.log(success);
      if (success) {
        updateButton('connected');
      } else {
        updateButton('disconnected');
        window.alert('Failed to connect.');
      }
    });
  });
  
});

// Connect Button UI Updater
function updateButton(status) {
  switch (status) {
    case status === 'connected':
      connectBtn.classList.add('success');
      connectBtn.textContent = 'Connected';
      connectBtn.disabled = true;
      break;
    case status === 'connecting':
      connectBtn.textContent = 'Connecting...';
      connectBtn.disabled = true;
      break;
    default:
      break;
  }
}
