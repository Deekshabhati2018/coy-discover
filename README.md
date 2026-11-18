# Coy Discover 💗

A mobile-first dating discovery application built with React, Node.js, Express and SQLite. Coy Discover allows users to explore profiles, like or pass on people, and connect through mutual matches.

## ✨ Features

- **Discover Feed:** Browse one profile at a time with profile photos, bios, locations and interests.
- **Swipe Interactions:** Like or pass using buttons or swipe gestures.
- **Mutual Matching:** A match is created only when two users like each other.
- **Privacy First:** One-sided likes are never revealed to the logged-in user.
- **Matches:** View profiles with whom a mutual match has been established.
- **Persistent Storage:** Swipes and matches are stored in SQLite and survive application restarts.
- **Responsive UI:** Mobile-first design with smooth animations and intuitive navigation.
- **Demo Data:** 30 seeded mock profiles, including profiles with incoming likes.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite |
| Styling | CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | SQLite, better-sqlite3 |
| Development | Nodemon, Git |

## 📁 Project Structure

```text
coy-discover/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── db.js
│   ├── data/
│   │   └── coy.sqlite
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   └── main.jsx
│   └── package.json
│
└── .gitignore
```

The SQLite database is generated locally when the backend initializes. It is excluded from Git.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Deekshabhati2018/coy-discover.git
cd coy-discover
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL displayed in your terminal, usually:

`http://localhost:5173`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/feed` | Retrieves profiles that have not been swiped on |
| POST | `/swipe` | Records a like or pass and checks for a mutual match |
| GET | `/matches` | Retrieves mutual matches |
| GET | `/health` | Checks backend health |

### Swipe API Example

**Request**

```json
{
  "profileId": 2,
  "action": "like"
}
```

**Successful mutual match response**

```json
{
  "success": true,
  "matched": true,
  "message": "It's a match!"
}
```

Valid swipe actions are `like` and `pass`.

## 🔐 Matching and Privacy Logic

- Each swipe is stored in the SQLite database.
- A user cannot swipe on the same profile more than once.
- A match is created only when both users have liked each other.
- One-sided likes are not returned by the Matches API.
- Profiles already swiped on are excluded from the Discover feed.
- Match records are persisted across server restarts.

## 🧪 Demo Configuration

The application currently uses a single demo logged-in user with ID `1`.

The database seeds 30 mock profiles and incoming likes to demonstrate mutual matching without requiring an external authentication provider.

## 📌 Future Improvements

- User authentication and profile management.
- Real-time messaging between matched users.
- Image uploads and profile customization.
- Advanced profile discovery and filtering.
- Production deployment and database configuration.

## 👩‍💻 Author

**Deeksha Bhati**

GitHub: [@Deekshabhati2018](https://github.com/Deekshabhati2018)

---

Built as part of the Coy Software Development Engineer Intern assignment.
