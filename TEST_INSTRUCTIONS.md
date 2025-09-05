# Etsy Seller Chatbot - Local Testing Instructions

## Prerequisites
- Node.js installed
- Chrome browser installed
- Backend server code and Chrome extension files ready

## Step 1: Start Backend Server
1. Open a terminal in the project directory.
2. Run:
   ```
   node backend/server.js
   ```
3. Confirm the server is running and listening on port 3000.

## Step 2: Load Chrome Extension
1. Open Chrome browser.
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle top right).
4. Click "Load unpacked".
5. Select the project directory containing `manifest.json`.
6. Confirm the extension is loaded without errors.

## Step 3: Test Extension on Etsy Website
1. Navigate to https://www.etsy.com
2. You should see the floating chatbot iframe at bottom right.
3. Click the extension icon and open the popup.
4. Click "Login with Etsy" button to start OAuth login.
5. Complete Etsy login and authorization.
6. After successful login, the chatbot can fetch and send messages via backend.

## Step 4: Interact with Chatbot
1. Type messages in the chatbot input box.
2. Send messages and observe responses.
3. Monitor backend terminal for API call logs.

## Step 5: Troubleshooting
- If chatbot does not appear, reload the Etsy page.
- Check Chrome extension console for errors (`chrome://extensions/` > Details > Inspect views).
- Check backend server logs for errors.

---

Follow these steps to verify the extension functionality and integration.

Please let me know if you encounter any issues or need further assistance.
