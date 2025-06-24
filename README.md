# Report System

## Overview
A fullstack web application with feature-based structure (Node.js/Express + React).

## Features
- User authentication (JWT)
- Report management
- Admin dashboard
- Feature-based code structure
- Error handling, validation, logging

## Getting Started

### Backend
1. `cd report-system`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. `npm start`

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

## Project Structure
```
report-system/
  features/
  config/
  prisma/
  middleware/
  server.js
  .env.example
  README.md
client/
  src/
    features/
    hooks/
    utils/
    context/
    App.jsx
    main.jsx
    index.css
```

## Testing
- Backend: `npm test`
- Frontend: `npm run test`

## Docker (optional)
- See Dockerfile and docker-compose.yml for containerization

## License
MIT 