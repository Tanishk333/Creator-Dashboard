# Creator Dashboard

A full-stack web application for content creators to manage their profile, earn credits, and interact with a personalized content feed.

## Features
- **User Authentication:** JWT-based login/register, role-based access (User/Admin)
- **Credit System:** Earn credits for daily login, profile completion, and feed interaction; admin can adjust credits
- **Feed Aggregator:** Fetches posts from Reddit and simulated LinkedIn data
- **User Dashboard:** View credits, saved content, recent activity
- **Admin Dashboard:** User analytics, credit management, feed reports
- **Modern UI:** Built with React.js and Tailwind CSS

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm
- MongoDB Atlas account (free tier)

### Backend Setup
1. From the project root, install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file in the root with:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   ```
3. Start the backend server from the root:
   ```sh
   npm run server
   ```

### Frontend Setup
1. From the project root, start the frontend dev server:
   ```sh
   npm run dev
   ```

### Seed Data
- The backend automatically creates initial credits for new users and simulates LinkedIn posts in the feed.

## Deployment
- **Frontend:** Deploy to [Vercel](https://vercel.com/)
- **Backend:** Deploy to [Render](https://render.com/) or [Railway](https://railway.app/)
- **Database:** Use MongoDB Atlas Free Tier

## Folder Structure
```
Creator dashboard/
├── server/
│   ├── index.js
│   ├── models/
│   ├── routes/
│   └── middleware/
├── src/
│   ├── pages/
│   ├── components/
│   ├── contexts/
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

## License
MIT