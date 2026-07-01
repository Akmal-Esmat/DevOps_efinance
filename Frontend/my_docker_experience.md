On Windows, when you install Docker Desktop, the docker command (CLI) is just a client. Docker CLI ---Api request---> Docker engine

Run Docker without Docker desktop -> sudo systemctl start docker

Does it matter if I run Docker from WSL or PowerShell? NO


Node: any device connected to a specific network
host is a node that participate in user applications

docker run -p 8000:8000 myapp
Docker says:
"If someone connects to port 8000 on the host, I'll forward that traffic to port 8000 inside the container."
It doesn't force your application to listen. It only forwards traffic.
Browser
    │
localhost:8000
    │
Docker
    │
Container:8000
    │
Your application

Uvicorn running on http://0.0.0.0:8000
"I'm listening on every network interface."

Docker can successfully forward traffic.

--host 0.0.0.0          ->       Listen on every interface.

problem: by default Next js listen on the local host 127.0.0.1, so when I run it on the Container (an isolated mini environment acting as a mini pc) it is listening on it own local host -> only accept connection from inside the container

solution: --host 0.0.0.0 make the container listen on every port on it, then bind it with the device actual port (-p)

You do not need to build or compile Python files in a Dockerfile because Python is an interpreted language, meaning its source code is executed line-by-line at runtime by the Python interpreter rather than being pre-compiled into a binary file.

your docker-compose.yml file has the final say and completely overwrites the Dockerfile settings (ex: the port binding is overwritten)

Docker compose up: tells Docker Compose to force a fresh build of the image before it attempts to launch the container. docker compose up: Builds and starts containers.

Docker compose up:  it does not build a single combined image for the entire Compose file.

# Docker compose
    1- every time it run it trigger the Dockerfiles in the context: <foldername/> and create a new image
    2- give them pre installed images:

    services:
  frontend-service:
    image: myapp-frontend:latest  # Looks for this image locally or on Docker Hub
    ports:
      - "3000:3000"


# Backend dockerfile:

    dOCKER ENV

    cmd vs entrypoint

    use of EXPOSE

    Must use CMD [ "fastapi", "dev", "/app/main.py", "--host", "0.0.0.0"] the host option (thing to do with linux self hosting is 0.0.0.0 & windows is 127.0.0.1 || wsl?)

    ADD vs COPY

    file structure

# Next js dockerfile:
    if COPY .. (it is too large so use it at the bottom of the file)
    WHEN to use build, copy, run

    did not use it (not sure if it is important!):
    {
    add: output: "standalone" // type of build output
        or output: "export" // type of build output
        to
        next.config.ts 
    }

    use RUN -> During docker build.
    Use CMD -> During docker run.

    Rule of thumb: Use CMD for the final step that starts your actual application server or execution script.

    at last donnot CMD ["npm", "run", "dev"] as this is the development server (local host) (do not need to build first as it does hot reload).

    use CMD ["npm", "start"] as this is the production server (must build before)

# Bash scripting:
docker build . -t ef-frontend:1.0
docker run <image id/name>
-p 8001:8000 // bind port 8001 (on my device) to port 8000 (on the container or that the container uses)
docker rm <docker container id/name>
docker rmi <docker image id/name>
docker compose up
docker compose down
docker push <image name>: <tag (version)>, deploy on dockerhub with a repositories with the same image name
( -t (--tag) is name for the image, --name is name for the container)
docker 
    VIM: vi: run this file (ex: vi run.sh)
        :x -> write (save) and quit
