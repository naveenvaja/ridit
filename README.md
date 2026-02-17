RIDIT – Waste Collection Web App

Stack:
- Backend: Flask
- Frontend: React
- Database/Auth/Storage: Firebase

Steps:
1. Add Firebase keys
2. Backend: cd backend && python app.py
3. Frontend: cd frontend && npm install && npm start

Notes:
- For local development, you can set the path to your Firebase service account JSON using the environment variable `FIREBASE_SERVICE_ACCOUNT_PATH`.
- Alternatively drop `serviceAccountKey.json` into the `backend/` folder (do not commit it). The repo uses an in-memory mock database when credentials are not present.
