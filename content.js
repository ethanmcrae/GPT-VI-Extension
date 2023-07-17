chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'receiveMessage') {
    // Handle incoming message from server
    handleMessageFromServer(request.data);
  }
});

function sendInputToServer(input) {
  chrome.runtime.sendMessage({action: 'sendMessage', data: input});
}

function handleMessageFromServer(data) {
  console.log(data);
}
