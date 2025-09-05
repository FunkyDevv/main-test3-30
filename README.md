# ePro AI Chrome Extension

A Google Chrome extension that injects a floating chatbot into websites, allowing users to interact with ePro AI assistant.

## Features

- **Floating Chatbot UI**: Injects a chatbot interface into Etsy website pages
- **Etsy API Integration**: Fetch and send messages via Etsy API
- **Firebase Integration**: Store messages and user preferences in Firestore
- **OAuth 2.0 Authentication**: Secure Etsy seller login
- **Etsy-like Theme**: UI designed to match Etsy's color scheme and design

## Project Structure

```
eproai/
├── manifest.json          # Chrome extension manifest
├── content.js             # Content script for injection
├── chatbot.html           # Chatbot UI
├── chatbot.js             # Chatbot functionality
├── styles.css             # Etsy-themed styling
├── popup.html            # Extension settings popup
├── background.js          # Background service worker
├── package-lock.json      # Frontend dependencies
├── README.md             # This file
└── backend/
    ├── server.js          # Express.js backend server
    ├── package.json       # Backend dependencies
    ├── firebase-config.js # Firebase configuration
    └── etsy-config.js    # Etsy API configuration
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Server will run on `http://localhost:3000`

### Chrome Extension Setup
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `eproai` directory
5. The extension will be loaded and active

### Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore and Authentication
3. Generate a service account key
4. Replace the placeholder in `backend/firebase-config.js` with your actual service account credentials

### Etsy API Configuration
1. Register your app at https://www.etsy.com/developers/register
2. Get your Client ID and Client Secret
3. Update `backend/etsy-config.js` with your credentials
4. Set the redirect URI to `http://localhost:3000/auth/etsy/callback`

## Usage

1. Install the Chrome extension
2. Navigate to any Etsy page
3. The floating chatbot will appear in the bottom-right corner
4. Click the extension icon to access settings and login

## API Endpoints

- `GET /auth/etsy/login` - Redirect to Etsy OAuth login
- `GET /auth/etsy/callback` - Handle OAuth callback
- `GET /api/messages` - Fetch Etsy messages
- `POST /api/messages/reply` - Send message replies

## Development

### Testing the Extension
- Load the extension in Chrome developer mode
- Visit https://www.etsy.com/ to test injection
- Use the browser console for debugging

### Testing the Backend
- Start the server: `npm start`
- Test endpoints using curl or Postman
- Monitor console logs for debugging

## Dependencies

### Frontend
- Chrome Extension APIs
- No external dependencies

### Backend
- express: ^4.18.2
- cors: ^2.8.5
- axios: ^1.6.0
- firebase-admin: ^11.11.0

## Notes

- The Etsy API key is currently under review
- Firebase configuration uses placeholder credentials
- Backend server runs on port 3000 (configurable)
- Extension requires Etsy website permissions

## Next Steps

1. Complete Etsy API integration testing
2. Implement persistent token storage
3. Add automated response features
4. Enhance UI with message history
5. Add notification system
6. Implement message templates
7. Add analytics and reporting
"# demodemdoedmeod" 
