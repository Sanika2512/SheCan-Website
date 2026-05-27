# She Can Foundation - Participation Portal

A modern full-stack participation portal for girls interested in technology, leadership, and volunteering.

## Live Demo
https://shecan-website.onrender.com

## Folder Structure

```text
she-can-foundation-participation-portal/
├── config/
│   └── db.js
├── frontend/
│   ├── assets/
│   │   └── girl-coding.svg
│   ├── admin.html
│   ├── admin.js
│   ├── index.html
│   ├── script.js
│   └── style.css
├── models/
│   └── Submission.js
├── routes/
│   └── submissionRoutes.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js
```


## Features

- Responsive landing page with purple and pink gradient styling
- Glassmorphism cards, floating shapes, scroll reveal animations, and particles
- Motivational quote slider
- Animated statistics counters
- Participation form with validation, loading state, and success popup
- MongoDB storage using Mongoose
- Dynamic Girls Motivation Wall with a direct quote form
- Realtime wall updates with Server-Sent Events
- Hidden admin dashboard at `/admin.html`
- Dark mode toggle

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/submit` | Save participant name, email, message, and timestamp |
| `GET` | `/submissions` | Fetch submissions for the motivation wall |
| `GET` | `/submissions/stream` | Realtime updates for new motivation wall submissions |
| `GET` | `/health` | Check if the API is running |

Admin requests send the `x-admin-secret` header so the dashboard can display participant emails.

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/she_can_foundation?retryWrites=true&w=majority
ADMIN_SECRET=SHECAN2025
```

This project is already configured locally with the MongoDB Atlas URL you provided.

## Setup Instructions

1. Install Node.js from `https://nodejs.org/`.
2. Open a terminal in this project folder.
3. Install dependencies:

```bash
npm install
```

4. Start the backend and frontend together:

```bash
npm start
```

5. Open the site:

```text
http://localhost:5000
```

6. Open the hidden admin dashboard:

```text
http://localhost:5000/admin.html
```

Admin secret code:

```text
SHECAN2025
```

## Development Mode

For automatic server restart while coding:

```bash
npm run dev
```
## MongoAtlas Data Storage ScreenShot
<img width="1911" height="906" alt="image" src="https://github.com/user-attachments/assets/3568c466-0eae-46c4-9a72-4ba4cee244e5" />

