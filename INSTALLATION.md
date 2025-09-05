# Installation Guide - ePro AI

## Quick Start

### 1. Load Chrome Extension
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" button
5. Select the `eproai` folder on your desktop
6. The extension will appear in your extensions list

### 2. Start Backend Server
1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd c:/Users/biskw/OneDrive/Desktop/eproai/backend
   ```
3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Server will run on `http://localhost:3000`

### 3. Test the Extension
1. Visit https://www.etsy.com/
2. You should see a floating chatbot in the bottom-right corner
3. Click the extension icon in Chrome toolbar for settings

## Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F
```

**Extension not loading:**
- Make sure you selected the correct folder (etsybot, not a subfolder)
- Check Chrome console for errors (F12)

**Backend server errors:**
- Ensure all dependencies are installed: `npm install`
- Check Firebase credentials are properly configured

### Testing Endpoints

Once the backend is running, you can test these endpoints:

1. **Check server status:**
   ```bash
   curl http://localhost:3000
   ```

2. **Test messages endpoint:**
   ```bash
   curl http://localhost:3000/api/messages
   ```

### Browser Testing

1. **Check content script injection:**
   - Open Etsy.com
   - Right-click → Inspect
   - Check Elements tab for `#etsy-chatbot-iframe`

2. **Test chatbot functionality:**
   - Type messages in the chat input
   - Click send button
   - Messages should appear in the chat window

## Configuration Notes

- **Firebase**: Update `backend/firebase-config.js` with your service account credentials
- **Etsy API**: Update `backend/etsy-config.js` once your API key is approved
- **Port**: Backend runs on port 3000 by default (change in `backend/server.js` if needed)

## Next Steps After Installation

1. Wait for Etsy API approval to enable full functionality
2. Complete OAuth authentication setup
3. Test message sending/receiving with real Etsy data
4. Customize chatbot responses and automation rules
