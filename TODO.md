# TODO: Implement Language Validation Post-Check in server.js

## Steps to Complete
- [x] Add 'franc' to backend/package.json dependencies
- [ ] Run npm install to install the new dependency
- [x] Add language detection function in backend/server.js
- [x] Modify /chat endpoint to parse OpenAI response and extract [SELLER LANGUAGE BLOCK]
- [x] Implement post-check: detect language of [SELLER LANGUAGE BLOCK] using 'franc'
- [x] Add re-prompt logic if language doesn't match target (seller_language_code)
- [x] Implement retry logic (up to 2 retries) to avoid infinite loops
- [x] Add logging for detection results and re-prompts
- [x] Test the server with sample requests in different languages
- [x] Monitor logs and performance after implementation
