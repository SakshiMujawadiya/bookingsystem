const express = require('express');
const router = express.Router();

const API_DOCS = {
  title: 'Meeting Room Booking API',
  version: '1.0.0',
  description: 'RESTful API for office meeting room management, availability scheduling, and reservations.',
  workingHours: '09:00 - 18:00',
  endpoints: [
    {
      method: 'GET',
      path: '/api/health',
      description: 'Health check endpoint',
      response: '{ "status": "ok", "timestamp": "..." }',
    },
    {
      method: 'GET',
      path: '/api/rooms?date=YYYY-MM-DD',
      description: 'Get all rooms with booking count for the given date',
      query: { date: 'YYYY-MM-DD (optional, defaults to today)' },
      response: '[{ "id": "uuid", "name": "Atlas", "capacity": 10, "floor": "3rd Floor", "amenities": "TV, Whiteboard", "booking_count": 2 }]',
    },
    {
      method: 'POST',
      path: '/api/rooms',
      description: 'Create a new meeting room',
      body: { name: 'string (required, unique)', capacity: 'number >= 1', floor: 'string', amenities: 'string or array' },
      response: '{ "id": "uuid", "name": "Titan", "capacity": 12, "floor": "4th Floor", "amenities": "TV" }',
    },
    {
      method: 'GET',
      path: '/api/rooms/:id',
      description: 'Get single room by ID with all its bookings',
      params: { id: 'UUID' },
    },
    {
      method: 'GET',
      path: '/api/rooms/:id/next-available?date=YYYY-MM-DD&duration=MINUTES',
      description: 'Find next open time slot in working hours (09:00-18:00)',
      query: { date: 'YYYY-MM-DD', duration: 'integer (minutes, e.g. 30, 60)' },
      response: '{ "room_id": "uuid", "date": "2026-09-14", "duration": 30, "next_available_slot": "10:30" }',
    },
    {
      method: 'GET',
      path: '/api/bookings?room_id=UUID&date=YYYY-MM-DD',
      description: 'List bookings filtered by date and/or room',
      query: { room_id: 'UUID (optional)', date: 'YYYY-MM-DD (optional)' },
      response: '[{ "id": "uuid", "room_id": "uuid", "room_name": "Atlas", "title": "Sprint Planning", "booked_by": "Sakshi", "date": "2026-09-14", "start_time": "10:00:00", "end_time": "11:00:00" }]',
    },
    {
      method: 'POST',
      path: '/api/bookings',
      description: 'Create a new room booking (validates overlaps, working hours, and past dates)',
      body: { room_id: 'UUID', title: 'string', booked_by: 'string', date: 'YYYY-MM-DD (cannot be past)', start_time: 'HH:MM', end_time: 'HH:MM' },
      response: '{ "id": "uuid", "title": "Design Sync", ... } (or 409 Conflict if slot is occupied)',
    },
    {
      method: 'DELETE',
      path: '/api/bookings/:id',
      description: 'Cancel an existing reservation',
      params: { id: 'UUID' },
      response: '{ "message": "Booking canceled successfully", "booking": { ... } }',
    },
  ],
};

function renderDocsHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation — Meeting Room Booking System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card: #131b2e;
      --border: #1e293b;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --get: #10b981;
      --post: #3b82f6;
      --delete: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 32px 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    header { margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .badge {
      display: inline-block;
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p.lead { color: var(--text-muted); font-size: 15px; }
    .rules {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 16px;
      font-size: 13px;
    }
    .rules strong { color: #fff; }
    .endpoint {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 16px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .endpoint:hover { border-color: #334155; }
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: rgba(15, 23, 42, 0.6);
      border-bottom: 1px solid var(--border);
    }
    .method {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      color: #fff;
    }
    .method.GET { background: var(--get); }
    .method.POST { background: var(--post); }
    .method.DELETE { background: var(--delete); }
    .path { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500; color: #f8fafc; }
    .endpoint-body { padding: 16px 18px; font-size: 14px; }
    .desc { color: var(--text-muted); margin-bottom: 12px; }
    pre {
      background: #090d16;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #cbd5e1;
      overflow-x: auto;
      margin-top: 8px;
    }
    .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-top: 10px; }
    footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">v${API_DOCS.version} • REST API</span>
      <h1>${API_DOCS.title}</h1>
      <p class="lead">${API_DOCS.description}</p>
      <div class="rules">
        <strong>Business Rules:</strong> Operating hours: <strong>${API_DOCS.workingHours}</strong> | Bookings cannot overlap | Cannot book in the past | Minimum slot duration: 15 mins.
      </div>
    </header>

    <div>
      ${API_DOCS.endpoints
        .map(
          (ep) => `
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method ${ep.method}">${ep.method}</span>
            <span class="path">${ep.path}</span>
          </div>
          <div class="endpoint-body">
            <div class="desc">${ep.description}</div>
            ${ep.params ? `<div class="section-title">URL Parameters</div><pre>${JSON.stringify(ep.params, null, 2)}</pre>` : ''}
            ${ep.query ? `<div class="section-title">Query Parameters</div><pre>${JSON.stringify(ep.query, null, 2)}</pre>` : ''}
            ${ep.body ? `<div class="section-title">Request Body</div><pre>${JSON.stringify(ep.body, null, 2)}</pre>` : ''}
            ${ep.response ? `<div class="section-title">Example Response</div><pre>${ep.response}</pre>` : ''}
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <footer>
      Meeting Room Booking API &bull; Built with Node.js, Express & PostgreSQL
    </footer>
  </div>
</body>
</html>`;
}

router.get('/docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(renderDocsHtml());
});

router.get('/api/docs', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json(API_DOCS);
  }
  res.setHeader('Content-Type', 'text/html');
  res.send(renderDocsHtml());
});

module.exports = router;
