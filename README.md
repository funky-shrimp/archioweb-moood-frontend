# Moood — Frontend

Moood is a mashup between a whiteboard and Pinterest. It was developed for the course "DevMobil" at HEIG-VD in Media Engineering.

This is the frontend repository. A live deployment is available:

Live demo: https://archioweb-moood-frontend.onrender.com

The backend is consumed via a REST API; configure the API URL in your environment (see Configuration).

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
- Authentication (signup/login with JWT)
- Boards: create, edit, view; publish renders a 9:16 image from the canvas
- Social: likes, comments, follows
- Interactive canvas: drag & drop (mouse + touch), layer ordering
- Mobile-first responsive UI
- Mobile hardware: shake-to-randomize (DeviceMotion), touch drag

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
All configuration is managed via environment variables. Create a `.env` file at the project root and set the following:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` (proxy) |
| `VITE_USE_FIXTURES` | Use local fixtures instead of API | `false` |

Enable fixtures for frontend-only development (lets you explore UI without a backend):

```env
VITE_USE_FIXTURES=true

Notes:
- In production (Render), set `VITE_API_URL` to your backend’s public `/api` base URL, or keep `/api` if the frontend is reverse-proxying to the backend under the same domain.
- Authentication is enforced by router guards; accessing protected routes without a valid token redirects to Signup/Login.
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
├── websocket/          
│   └── wsClient.js
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
- The frontend consumes the backend REST API via Axios ([src/services/api.js](src/services/api.js)).
- Authorization: Bearer token from Pinia store (`auth_token`), automatically injected in request headers.
- Endpoints used (examples):
	- `GET /boards` — list boards
	- `POST /boards` — create a board (with `title`, `description`, `imageUrl`, `isPublic`)
	- `GET /boards/:id` — board details
	- `POST /boardsLike/:id` / `DELETE /boardsLike/:id` — like/unlike
	- `GET /boards/:id/comments` — list comments
	- `POST /boards/:id/comments` — add comment

See backend docs for full API reference (`/api/docs`).

### Publishing flow
When you publish a board from the editor, the app renders the current layout to a 360×640 canvas (ratio 9:16) and posts the resulting `imageUrl` (data URL) to the backend along with metadata.

## Dependencies
- Runtime: `vue`, `vue-router`, `pinia`, `axios`, `quasar`, `vue3-toastify`
- Dev: `vite`, `@vitejs/plugin-vue`, `@quasar/vite-plugin`, `vite-plugin-vue-devtools`

## Deployment
- Frontend deployed to Render: https://archioweb-moood-frontend.onrender.com
- Ensure `VITE_API_URL` points to the backend (Render or other) and that CORS/headers allow the domain.

## Mobile hardware
- Shake-to-randomize: on mobile, a device “shake” randomizes element positions and z-order in the editor. On iOS, motion permissions may require a user gesture to enable DeviceMotion events.

## License
This project is for educational purposes at HEIG-VD (DevMobil).



