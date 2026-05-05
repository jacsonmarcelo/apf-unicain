# Finanza: Financial Planning & Analysis

This application is built with React, Tailwind CSS, and Firebase.

## Setup & Deployment

### 1. Firebase Configuration
The application uses Firebase for Authentication and Firestore for data persistence.
Ensure that `firebase-applet-config.json` is correctly populated with your Firebase project credentials.
In the Firebase Console, you should enable:
- **Authentication**: Google Provider.
- **Cloud Firestore**: Native mode.

### 2. Security Rules
The Firestore security rules are defined in `firestore.rules`. Deploy them using the `deploy_firebase` tool or via the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 3. Environment Variables
Ensure `GEMINI_API_KEY` is set in your environment if you plan to use AI features.

### 4. Running Locally
```bash
npm install
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

The production build will be available in the `dist` folder.
