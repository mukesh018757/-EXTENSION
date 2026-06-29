# TimeTracker Pro

A complete Chrome Extension + Node.js + MongoDB project for time tracking and productivity analytics.

## Features
- Track website time in a Chrome extension
- Classify sites as productive, unproductive, or neutral
- Show popup analytics and a full dashboard
- Save settings in Chrome storage
- Sync data to a Node.js + Express backend
- Store user activity in MongoDB

## Folder Structure
- extension/ contains the Chrome extension files
- server/ contains the backend API and MongoDB models

## Setup
1. Install Node.js dependencies:
   - cd server
   - npm install
2. Start MongoDB locally
3. Run the backend:
   - npm start
4. Load the extension in Chrome:
   - Open chrome://extensions
   - Enable Developer mode
   - Load unpacked and select the extension folder

## Notes
- The extension works offline using chrome.storage.local
- Backend sync is attempted when a JWT token is available
- The project uses simple, student-friendly code for assignment purposes
