# Meeting Room Booking System

A full-stack meeting room booking application built with Node.js/Express, PostgreSQL, and Next.js. It lets users view available conference rooms, schedule meetings without overlaps, browse past booking history, and add new meeting rooms.

## Links

- **GitHub Repository**: https://github.com/SakshiMujawadiya/bookingsystem
- **Live Frontend**: https://bookingsystem-frontend.vercel.app
- **Live Backend API**: https://bookingsystem-api.onrender.com
- **API Docs**: https://bookingsystem-api.onrender.com/docs (or `http://localhost:8000/docs` locally)

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL (`pg`)
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons
- **Database**: PostgreSQL hosted on Neon

I intentionally kept dependencies minimal — no heavy libraries like moment, uuid, or form validators. All validation and interval math use native JavaScript.

## Getting Started Locally

### Prerequisites

- Node.js (v18+)
- A PostgreSQL database (local or Neon/Supabase)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and configure your database connection string:

```env
PORT=8000
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
CORS_ORIGIN=*
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

The server starts on `http://localhost:8000`. On first run, it automatically creates the `rooms` and `bookings` tables and seeds 6 default rooms if the table is empty.

### 2. Frontend Setup

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Make sure `frontend/.env.local` has:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the Next.js dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## How I Approached the Booking Logic & Edge Cases

1. **Overlap and Conflict Detection**
   A common mistake in booking systems is only checking if the start times match. To properly prevent double-booking, reservations must be treated as intervals. Two bookings clash if:
   `existing_start < requested_end AND existing_end > requested_start`
   This query covers exact matches, partial overlaps, and one meeting inside another. When a clash is detected, the API returns a `409 Conflict` with the conflicting booking's details so the frontend can display exactly who booked that time.

2. **Past Date Handling**
   - The backend validates that booking dates cannot be in the past (`date < today` returns a `400 Bad Request`).
   - On the frontend, users can still click back into past dates to review previous meeting history, but the "Book" button is disabled and an informative banner is displayed explaining that past dates are read-only.

3. **Timezone Offset Bugs**
   Using `new Date().toISOString().split('T')[0]` shifts the date back by a day in timezones east of UTC (like IST `+05:30`) late at night. To fix this, I used local date getters (`getFullYear()`, `getMonth() + 1`, `getDate()`) across both frontend and backend to guarantee the date matches the user's actual calendar day.

4. **Finding the Next Available Slot**
   In `slotService.js`, the algorithm pulls all existing bookings for a room on a selected date, sorts them, and checks for gaps of the requested duration within business hours (09:00 to 18:00). If it finds a gap, it suggests the start time to the user.

5. **Database Indexing**
   Added an index on `(room_id, date)` in PostgreSQL:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_bookings_room_date ON bookings(room_id, date);
   ```
   This prevents full table scans when checking availability or rendering a day's schedule.

## API Endpoints

Interactive documentation is available at `/docs`.

- `GET /api/rooms?date=YYYY-MM-DD` — List all rooms with booking count for the day
- `POST /api/rooms` — Create a new room (name, capacity, floor, amenities)
- `GET /api/rooms/:id` — Get single room details and its reservations
- `GET /api/rooms/:id/next-available?date=YYYY-MM-DD&duration=MINUTES` — Find next open slot
- `GET /api/bookings?room_id=UUID&date=YYYY-MM-DD` — List bookings filtered by room or date
- `POST /api/bookings` — Create a booking
- `DELETE /api/bookings/:id` — Cancel a booking
- `GET /api/health` — Health check

## Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/   # roomController.js, bookingController.js
│   │   ├── models/        # roomModel.js, bookingModel.js (SQL queries)
│   │   ├── routes/        # rooms.js, bookings.js, docs.js
│   │   ├── services/      # slotService.js (availability logic)
│   │   ├── middleware/    # errorHandler.js
│   │   ├── config.js      # App configuration
│   │   ├── db.js          # PostgreSQL pool connection
│   │   ├── index.js       # App entrypoint
│   │   ├── seed.js        # Seed rooms
│   │   └── validation.js  # Request validation helpers
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/           # page.tsx, layout.tsx, globals.css
│   │   ├── components/    # RoomCard, BookingModal, CreateRoomModal, DatePicker, etc.
│   │   └── lib/           # api.ts, types.ts
│   └── package.json
└── README.md
```

## What I Didn't Finish / What I Would Add Next

To be transparent, here are features I chose not to implement due to time constraints:

1. **User Authentication & Permissions**: Right now, anyone can type a name to book and anyone can cancel any booking. In a full production app, I'd add authentication (OAuth / JWT) so only the meeting creator or an administrator can cancel a reservation.
2. **Recurring Meetings**: The system currently handles single reservations. Adding recurring rules (e.g. daily standup, weekly sync) with bulk conflict checks would be the next step.
3. **Real-time Updates**: When a booking is made, other open tabs have to refresh or change dates to see it. Adding WebSockets or Server-Sent Events (SSE) would allow instant multi-user synchronization.
4. **Calendar Export / Email**: Sending `.ics` invites or email notifications on booking creation.
