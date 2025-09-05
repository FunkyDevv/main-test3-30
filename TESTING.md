# Etsy Seller Chatbot - Thorough Testing Plan

## 1. Backend Etsy OAuth 2.0 Login Flow Testing
- Test the `/auth/etsy/login` endpoint redirects to Etsy OAuth login page.
- Complete OAuth login and verify `/auth/etsy/callback` exchanges code for access token.
- Verify access token is stored and used for subsequent API calls.

## 2. Etsy API Integration Testing
- Test `/api/messages` GET endpoint returns real Etsy messages.
- Test `/api/messages/reply` POST endpoint sends replies successfully.
- Test error handling for invalid tokens or missing parameters.

## 3. Frontend Chatbot UI Integration Testing
- Verify chatbot iframe injects correctly on Etsy website.
- Test sending messages from chatbot UI calls backend API.
- Verify responses from backend display correctly in chatbot.

## 4. Chrome Extension Content Script and Popup Testing
- Test extension installs and activates on Etsy domain.
- Verify popup UI loads and Etsy login button triggers OAuth flow.
- Test communication between popup, background, and content scripts.

## 5. Error Handling and Edge Cases
- Test backend API with invalid or expired tokens.
- Test frontend UI with network failures or backend errors.
- Verify graceful error messages and recovery.

## 6. UI/UX Testing
- Verify chatbot UI matches Etsy theme and is responsive.
- Test chatbot floating behavior and close/open functionality.
- Test usability and accessibility.

---

# Manual Testing Instructions

1. Start backend server: `node backend/server.js`
2. Load unpacked Chrome extension from project directory.
3. Navigate to https://www.etsy.com and verify chatbot appears.
4. Use popup to login via Etsy OAuth.
5. Send and receive messages via chatbot UI.
6. Monitor backend logs for API calls and errors.

---

Please follow this plan and report any issues or feedback for fixes and improvements.
