## Real-Time Collaborative Drawing Canvas

A real-time multi-user drawing application where multiple users can draw simultaneously on a shared canvas. All drawing actions are synchronized instantly across connected clients using WebSockets.

---

## Features

### Drawing Tools

* Brush
* Eraser
* Multiple colors
* Adjustable stroke width

### Real-Time Collaboration

* Live drawing synchronization
* Real-time cursor indicators
* Multiple users drawing simultaneously

### User Management

* Online users list
* Unique color assigned to each user

### Undo / Redo

* Global undo and redo
* Works across all users
* Eraser actions are undoable and redoable

---

## Tech Stack

### Frontend

* React
* HTML5 Canvas API
* Socket.io Client

### Backend

* Node.js
* Express
* Socket.io

---

## Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html
│   ├── index.css
│   ├── CanvasBoard.jsx
│   ├── socket.js
│   └── main.jsx
├── server/
│   ├── server.js
│   ├── rooms.js
│   └── state-manager.js
├── package.json
├── README.md
└── ARCHITECTURE.md

```

---

## Setup Instructions

### Prerequisites

* Node.js v18+
* npm

---

### 1. Install Server Dependencies

```bash
cd server
npm install
node server.js
```

Server runs on:

```
http://localhost:5000
```

---

### 2. Install Client Dependencies

```bash
cd client
npm install
npm run dev
```

Client runs on:

```
http://localhost:5173
```

---

## How to Test with Multiple Users 

1. Open the app in **two or more different browsers** (Chrome, Firefox, Edge).
2. Draw in one browser.
3. Observe:

   * Live strokes
   * Cursor movement
   * Undo/redo syncing
   * Online users list updating

---

## Known Limitations / Bugs 

* No drawing persistence (canvas resets on server restart).
* Performance may degrade with very high user counts.
* Mobile touch support not implemented.

---

## Time Spent on the Project

- Design & architecture: ~4 hours  
- Core implementation: ~12 hours  
- Debugging & refinement: ~7 hours  
- Documentation: ~2 hours  

**Total**: ~25 hours


---

## Documentation

* `ARCHITECTURE.md` — detailed system design and reasoning

---

## Summary

This project demonstrates a real-time collaborative drawing system built using raw HTML Canvas APIs and WebSockets. It focuses on smooth interaction, low latency, and consistent shared state, with special attention to global undo/redo and multi-user synchronization.

---
