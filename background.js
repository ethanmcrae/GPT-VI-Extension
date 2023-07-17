let socket = null;
let retryTimeout = 1000; // Start with a 1 second retry

function connect() {
  socket = new WebSocket('ws://localhost:3000');

  socket.onopen = (event) => {
    retryTimeout = 1000; // Reset the retry timeout
    // create a new 'disconnect' context menu
    chrome.contextMenus.create({
      id: 'gpt-vi-disconnect',
      title: 'Disconnect from GPT VI',
      contexts: ['page'],
      documentUrlPatterns: ['*://chat.openai.com/*'],
    });
  };

  socket.onmessage = (event) => {
    console.log('Message from server ', event.data);
    // Forward the message to the content script
    chrome.tabs.sendMessage(sender.tab.id, {action: 'receiveMessage', data: event.data});
  };

  socket.onclose = (event) => {
    console.log('Failed to connect to websocket server... trying again in', `${retryTimeout * 1.1}ms`);
    socket = null;

    // Try to reconnect after a delay, increasing the delay each time
    setTimeout(connect, retryTimeout);
    retryTimeout *= 1.1;
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendMessage' && socket) {
    socket.send(request.data);
  }
});

// Add event listener for right click
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'gpt-vi-connect', // unique ID for this item
    title: 'Connect to GPT VI',
    contexts: ['page'], // this item will show up when you right-click on a page
    documentUrlPatterns: ['*://chat.openai.com/*'], // this item will only show up on pages that match this pattern
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'gpt-vi-connect') {
    // Initiate WebSocket connection
    connect();

    // Remove the 'connect' context menu (right-click on page)
    chrome.contextMenus.remove('gpt-vi-connect', () => {
      if (chrome.runtime.lastError) {
        console.log(`Error: ${chrome.runtime.lastError}`);
      } else {
        console.log("'Connect to GPT VI' removed.");
      }
    });
  } else if (info.menuItemId === 'gpt-vi-disconnect') {
    // Terminate WebSocket connection
    socket.close();
    socket = null;
  }
});
