# 🏢 Meeting Room Booking System

A full-stack meeting room management and reservation platform built with a **Node.js/Express MVC** backend, **PostgreSQL** database, and **Next.js (React 19, TypeScript, Tailwind CSS)** frontend.

---

## 🔗 Project Links

- **GitHub Repository (Public)**: [https://github.com/SakshiMujawadiya/bookingsystem](https://github.com/SakshiMujawadiya/bookingsystem)
- **Live Frontend (Vercel)**: `https://bookingsystem-frontend.vercel.app` *(or your Vercel deployment URL)*
- **Live Backend (Render)**: `https://bookingsystem-api.onrender.com` *(or your Render web service URL)*
- **Interactive API Docs**: `https://bookingsystem-api.onrender.com/docs` *(also accessible locally at `http://localhost:8000/docs`)*

---

## 🛠 Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express (Structured in MVC: `models/`, `controllers/`, `routes/`, `services/`, `middleware/`).
- **Database**: PostgreSQL (Hosted on Neon) with parameterized connection pooling and index optimization.
- **Zero Heavy External Bloat**: No unneeded third-party libraries; pure regex validators and native date handling.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=8000
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
CORS_ORIGIN=*
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
*(For production on Vercel, set `NEXT_PUBLIC_API_URL` to your live Render backend URL)*

---

## 🚀 Local Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/SakshiMujawadiya/bookingsystem.git
cd bookingsystem
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure your environment variables
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL

# Start development server
npm run dev
# Server runs on http://localhost:8000
# API Docs available at http://localhost:8000/docs
```

The database tables (`rooms`, `bookings`) and sample data will automatically initialize and seed on first startup.

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Configure your environment variables
cp .env.example .env.local

# Start development server
npm run dev
# Client runs on http://localhost:3000
```

---

## 🧠 Approach to Booking Logic & Edge Cases

1. **Overlap Prevention**:
   Instead of just checking if start times match, reservations are treated as mathematical open intervals `(start_time, end_time)`. Two slots overlap if and only if:
   ```sql
   WHERE room_id = $1 
     AND date = $2 
     AND start_time < $4 
     AND end_time > $3
   ```
   This accurately catches exact matches, partial overlaps, and nested/containing bookings. Any clash triggers a `409 Conflict` containing details of the conflicting booking.

2. **Past Date Handling**:
   - **Backend**: Any booking payload with `date < today` is blocked with a `400 Bad Request`.
   - **Frontend**: The date picker allows full calendar navigation so users can inspect past meeting history, but the "Book" button is disabled on past dates with an explanatory amber notice banner.

3. **Timezone Offset Bug Mitigation**:
   JavaScript's `.toISOString().split('T')[0]` shifts the date back by one day in timezones east of UTC (such as IST `+05:30`) when run around midnight. The app uses dedicated local date getters (`getFullYear()`, `getMonth() + 1`, `getDate()`) across both frontend and backend to ensure date strings always match the user's actual calendar day.

4. **Next Available Slot Engine**:
   [`slotService.findNextAvailable`](./backend/src/services/slotService.js) iterates through chronological bookings for a room on a given day, finding the earliest gap between working hours (`09:00` - `18:00`) that satisfies the requested meeting duration.

---

## 📋 API Reference Summary

Interactive UI available at `/docs` or `/api/docs`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/rooms?date=YYYY-MM-DD` | List all rooms with booking counts for the date |
| `POST` | `/api/rooms` | Create a new room with capacity, floor, and amenities |
| `GET` | `/api/rooms/:id` | Get room details and its reservations |
| `GET` | `/api/rooms/:id/next-available?date=YYYY-MM-DD&duration=30` | Find next available slot |
| `GET` | `/api/bookings?room_id=UUID&date=YYYY-MM-DD` | List bookings filtered by room or date |
| `POST` | `/api/bookings` | Reserve a room slot |
| `DELETE` | `/api/bookings/:id` | Cancel a reservation |

---

## 🔍 What Was Left Incomplete / Future Improvements

In the spirit of complete engineering honesty, here are features not implemented in this version:

1. **User Authentication & RBAC (Role-Based Access Control)**:
   - Currently, any user can type their name (`booked_by`) to book or click cancel.
   - *Future improvement*: JWT/OAuth2 session auth, where only the booking creator or an admin can cancel a reservation.
2. **Recurring Bookings**:
   - Only single-day reservations are supported.
   - *Future improvement*: Daily/weekly recurring patterns with bulk clash detection.
3. **Calendar Integration & Email Notifications**:
   - No automated email invites or `.ics` calendar sync (Google Calendar / Outlook).
4. **WebSocket / Real-Time Live Updates**:
   - The frontend refreshes data upon user actions (booking, canceling, changing dates) rather than using WebSocket server-sent events for instant multi-user synchronization.
