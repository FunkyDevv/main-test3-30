// background.js - Background service worker for Chrome extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Etsy Seller Chatbot extension installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request?.type) {
      case 'FETCH_ETSY_MESSAGES':
        fetchEtsyMessages(request.data || {})
          .then(messages => sendResponse({ success: true, messages }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // respond asynchronously

      case 'SEND_ETSY_REPLY':
        sendEtsyReply(request.data || {})
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

      case 'AUTHENTICATE_ETSY':
        authenticateEtsy()
          .then(token => sendResponse({ success: true, token }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (err) {
    sendResponse({ success: false, error: err?.message || 'Unhandled error' });
  }
});

// Placeholder functions for Etsy API integration
async function fetchEtsyMessages(params) {
  // TODO: Replace with Etsy API call. "params" likely includes shop/user identifiers, pagination, etc.
  console.log('Fetching Etsy messages with params:', params);
  return [{ id: 1, message: 'Sample message', from: 'customer@example.com' }];
}

async function sendEtsyReply(messageData) {
  // TODO: Replace with Etsy API call
  console.log('Sending Etsy reply:', messageData);
  return { success: true, messageId: Date.now() };
}

async function authenticateEtsy() {
  // TODO: Implement OAuth flow for Etsy
  console.log('Starting Etsy authentication');
  return 'placeholder_token';
}
