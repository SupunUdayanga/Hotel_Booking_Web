# Hotel Booking - One-command Auto Run

This project includes Dockerized backend (Node/Express), frontend (React + Vite, served by Nginx), and MongoDB. You can start everything with a single command, and optionally auto-start on Windows login.

## Prerequisites
- Docker Desktop for Windows
- PowerShell 5.1+ (default on Windows 10/11)

## Start the stack
- Double-click `scripts/run.ps1` or run it from PowerShell:

```
# from the project root (hotel/)
./scripts/run.ps1
```

- Optional rebuild (force image rebuild):
```
./scripts/run.ps1 -Rebuild
```

When the stack is up:
- Frontend: http://localhost:8080
- API (proxied through Nginx): http://localhost:8080/api

## Auto-start on Windows login (optional)
Create a Scheduled Task that runs the stack on user logon:
```
./scripts/register-auto-start.ps1
```
This registers a task named `HotelBookingAutoStart` that silently launches `scripts/run.ps1` at logon.

To remove the task later:
```
Unregister-ScheduledTask -TaskName HotelBookingAutoStart -Confirm:$false
```

## Environment
- `docker-compose.yml` uses development Dockerfiles:
  - `backend/Dockerfile` (Node running src/index.js)
  - `frontend/Dockerfile` (Vite dev server)
- Services have `restart: unless-stopped` for resilience.
- Frontend proxies `/api` to backend via Vite dev proxy (configured in `vite.config.js`).

## Notes
- Default JWT secret is a placeholder; update `JWT_SECRET` in `docker-compose.yml` for real deployments.
- MongoDB data persists in the `mongo_data` volume.

## Development (without Docker)
This repo is now structured as a small npm workspaces monorepo. You can run the frontend and backend directly for local development.

- From VS Code: use the tasks
  - "Run frontend dev server" (Vite, hot reload)
  - "Run backend dev server" (Express with nodemon)

- From a terminal at the repo root:

```
# start frontend (Vite)
npm run dev:frontend

# start backend (nodemon)
npm run dev:backend
```

## Project structure

```
hotel/
├─ backend/            # Node/Express API (src/, models/, controllers/, routes/)
├─ frontend/           # React + Vite app (src/pages, src/components, src/lib)
├─ scripts/            # Utility PowerShell scripts for Docker and auto-start
├─ .vscode/            # Preconfigured tasks to run dev servers
├─ docker-compose.yml  # Full stack (frontend+backend+mongo+nginx) for dev
├─ package.json        # npm workspaces and convenience scripts
└─ .editorconfig       # Consistent formatting across the repo
```

Notable changes in this refactor:
- Adopted npm workspaces with a root `package.json` for simpler dev commands.
- Standardized component directory to `frontend/src/components` (was `component`).
- Added `.editorconfig` and a root `.gitignore` for consistent tooling.
- Added `.vscode/tasks.json` to make running both servers one-click inside VS Code.

If you see duplicate old files under `frontend/src/component`, prefer the new `frontend/src/components` path. You can safely delete the old folder once any editors or dev servers have reloaded.
