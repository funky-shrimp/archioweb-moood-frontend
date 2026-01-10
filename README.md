# Moood — Frontend

Moood is a mashup between a whiteboard and Pinterest. It was developed for the course "ArchiOWeb" at HEIG-VD in Media Engineering.

This is the frontend repository. You can find the backend here.

## Table of Contents
- Features
- Getting Started
- Configuration
- Project Structure
- Scripts
- API Integration
- Dependencies
- License

## Features
- User authentication (JWT via backend API)
- Boards, labels, and elements management (create, edit, delete)
- Social features: likes, comments, follows
- Interactive canvas (pan/zoom, drag & drop)
- Mobile-first UI with responsive layout
- Mobile hardware features: shake-to-randomize (DeviceMotion), touch drag (Pointer Events)

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Modern browser (Chromium/Firefox/Safari mobile)

### Installation
Clone the repository:

```bash
git clone <repo-url>
cd archioweb-moood-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Configuration
All configuration is managed via environment variables.
Create a `.env` file at the project root and set the following:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |
| `VITE_USE_FIXTURES` | Use local fixtures instead of API | `false` |

Enable fixtures for frontend-only development:

```env
VITE_USE_FIXTURES=true
```

## Project Structure

```
src/
├── assets/          # Global styles, images
├── components/      # Reusable UI components
│   ├── BoardCanvas.vue
│   ├── BoardCard.vue
│   ├── Header.vue
│   ├── ProfileEdit.vue
│   └── ...
├── pages/           # Application views
│   ├── Explore.vue
│   ├── BoardView.vue
│   ├── BoardEdit.vue
│   ├── Profile.vue
│   └── ...
├── router/          # Vue Router
│   └── index.js
├── services/        # API client, helpers
│   └── api.js
├── stores/          # Pinia stores
│   └── auth.js
├── _dev/            # Fixtures for local development
│   └── fixtures.js
├── App.vue          # Root component
└── main.js          # Entry point
```

## Scripts
- `npm run dev` — Start the Vite dev server
- `npm run build` — Build production assets
- `npm run preview` — Preview the production build locally

## API Integration
- The frontend consumes the backend REST API via Axios (`services/api.js`).
- Routes use Vue Router guards to protect authenticated pages.
- For API documentation, refer to the backend project's docs (`/api/docs`).

## Dependencies
Runtime:
- `vue` — UI framework
- `vue-router` — Routing
- `pinia` — State management
- `axios` — HTTP client
- `quasar` — UI utilities (via Vite plugin)

Dev:
- `vite` — Build tool
- `@vitejs/plugin-vue` — Vue SFC support
- `@quasar/vite-plugin`, `vite-plugin-vue-devtools`

## License
This project is for educational purposes at HEIG-VD (ArchiOWeb).



