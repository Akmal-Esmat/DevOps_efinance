# Docker Guide

There are two Compose files in this project, and mixing them up is the most common source of confusion.

| File | Location | Purpose |
|---|---|---|
| `compose.yaml` | repo root | **Local development.** Builds both images from source on your machine. |
| `compose.prod.yaml` | `ansible/files/` | **Production.** Deployed by Ansible onto the Azure VM. Pulls a pre-built, pre-scanned, SHA-tagged image — never builds anything. |

You will essentially never touch the production file directly; it's fully managed by the deployment pipeline (see the root `README.md`). This guide covers local development.

**Working directory.** Every command below assumes you are in `DevOps_efinance/Efinance_DevOps` — the directory that directly contains `compose.yaml`. If you've just cloned the repository:

```bash
cd DevOps_efinance/Efinance_DevOps
```

## Running Locally

Create the `.env` file Compose reads — in `Efinance_DevOps`, the same directory as `compose.yaml`:

```bash
echo "OPENROUTER_API_KEY=your-key-here" > .env
```

Build and start both services:

```bash
docker compose up --build
```

Open the app at `http://localhost:3000`.

Run in the background instead, without rebuilding:

```bash
docker compose up -d
```

Stop everything:

```bash
docker compose down
```

## Checking Everything Is Working

```bash
docker compose ps
```
Both `frontend` and `backend` should show `running`, not `restarting` or `exited`.

```bash
docker compose logs backend
```
A missing `OPENROUTER_API_KEY` shows up here as a startup error.

```bash
curl http://localhost:8000/models
```
Should return a JSON list of models directly from the backend.

```bash
curl http://localhost:3000/api/models
```
Should return the same JSON, proxied through the frontend's Next.js rewrite. If this fails but the previous call works, the issue is in the frontend proxy configuration, not the backend.

```bash
docker compose exec backend printenv OPENROUTER_API_KEY
```
Confirms the key actually reached the running container, not just your `.env` file.

## Setting the API Key

Two different places read `OPENROUTER_API_KEY`, in two different ways:

**Running the backend directly with Python** (no Docker) reads `Backend/.env`, loaded automatically via `python-dotenv` on startup. Run this from `Efinance_DevOps`:

```bash
cp Backend/.env.example Backend/.env
# then edit Backend/.env with your real key
```

**Running via `docker compose up`** reads a `.env` file in the same directory as `compose.yaml`. Also run from `Efinance_DevOps`:

```bash
echo "OPENROUTER_API_KEY=your-key-here" > .env
```

`Backend/.env` is not picked up by Compose's variable substitution — only the root-level `.env`, or a variable exported in your current shell, are.

## The Dockerfiles

**Backend** (`Backend/Dockerfile`) — built from `python:3.13.3-slim`. Installs `requirements.txt`, copies in `main.py`, and runs as the built-in unprivileged `nobody` user (`USER 65534`) rather than root, which is what the Trivy misconfiguration scan checks for. It runs via `fastapi run`, the production ASGI server — the development server (`fastapi dev`) binds to the container's own loopback address only, which Docker has no way to forward external traffic to.

**Frontend** (`Frontend/Dockerfile`) — built from `node:22.13.1-alpine`. `package.json` and `package-lock.json` are copied and installed before the rest of the source, so Docker only redoes the slow `npm install` step when dependencies actually change, not on every source edit. Runs `npm run build` at image build time, then drops to the built-in non-root `node` user before starting with `npm run start` — Next.js's production server, which binds all interfaces by default (the dev server does not).

> Two additional Dockerfiles — `Dockerfile_Akml` and `Dockerfile_NotWorking` — currently sit in `Frontend/` from earlier experiments. Neither is referenced by any Compose file or workflow; safe to delete.

## Image Tagging Strategy

No image is ever deployed under `:latest`. Every push to `main` that passes the full `docker.yml` pipeline is tagged with that commit's short SHA (7 characters) and pushed under that tag alone. The VM's `.env` file records which `IMAGE_TAG` is currently deployed, and `compose.prod.yaml` references that value directly — so whatever is running on the VM at any moment is traceable back to one exact commit, build, and Trivy scan result.

## A Note on Port Mapping

`docker run -p 3000:3000 <image>` tells Docker to forward traffic arriving on host port 3000 into the container's port 3000 — nothing more. It's still entirely up to the process inside the container to actually listen there. If that process only binds its own container-local loopback address rather than all interfaces, Docker has nothing to forward the traffic to and the mapping silently does nothing. This is exactly why both Dockerfiles here run production servers: `next start` and `fastapi run` bind `0.0.0.0` by default, while their development-mode equivalents don't.

## Command Reference

```bash
docker build . -t <name>:<tag>        # build an image from the Dockerfile in cwd
docker run -p 8000:8000 <image>       # run it, mapping host:container port
docker ps                             # running containers
docker ps -a                          # all containers, including stopped
docker images                         # local images
docker exec -it <container> sh        # shell into a running container
docker logs <container>               # view logs
docker rm <container>                 # remove a stopped container
docker rmi <image>                    # remove an image
docker push <user>/<image>:<tag>      # push to a registry
```
