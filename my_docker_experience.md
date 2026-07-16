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

EXPOSE doesn't actually set the runtime port — it's purely documentation/metadata for anyone reading the Dockerfile (and used by some orchestration tools), it has no effect on what port the app inside actually binds to. Removing --port 8000 works here for a different reason: 8000 is already the FastAPI CLI's own default port

# Github Actions
job consist of runners (jobs are like a separate VMs)

By default, Docker runs every command and application inside the container as the root user, which is the all-powerful system administrator.

Here is the exact problem and how the fix solves it, broken down:

The Docker Default (root): When you don’t specify a user, Docker gives your application total control over the container's internal operating system. If a hacker exploits a flaw in your code, they instantly become root. From there, they can attempt a container escape—exploiting Linux kernel vulnerabilities to break out of the container boundaries and gain full control of your actual host server.

The Fixing Command (USER): Adding USER node or USER 65534 strips away these administrative privileges. It forces the application to run as a restricted, low-privilege guest. If a hacker breaks in, they are completely trapped in a locked-down sandbox, unable to modify system files or touch your cloud infrastructure.

my .yml file (CI only for now):
"
name: deploy to Dockerhub

on: 
  push:
    branches:
      - main

jobs:
  SCA:
    runs-on: ubuntu-latest
    steps:
        # The Checkout step clones the Git repository.
      - name: Checkout
        uses: actions/checkout@v7.0.0
        
      - name: Scan files
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: fs
          scan-ref: .
          # vuln is the default
          # secret is for hard coded secrets
          # misconfig is for insecure Dockerfiles, Kubernetes manifests,...
          scanners: vuln,secret,misconfig
          # fail if high/critical severity
          severity: HIGH,CRITICAL
          exit-code: '1'
          
  publish:
    needs: SCA
    runs-on: ubuntu-latest
    steps:

      # The Checkout step clones the Git repository again (each job is independent).
      - name: Checkout
        uses: actions/checkout@v7.0.0
        
      - name: Docker Login
        uses: docker/login-action@v4.2.0
        with:
            # Username to connect to Docker registry
            username: ${{ secrets.DOCKERHUB_USERNAME }}
            # Password or token to connect to Docker registry
            password: ${{ secrets.DOCKERHUB_TOKEN }}
              
      - name: Build images
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
        run: docker compose build

      - name: Scan frontend image
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: image
          image-ref: ef-frontend:latest
          severity: HIGH,CRITICAL
          exit-code: '1'
    
      - name: Scan backend image
        uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: image
          image-ref: ef-backend:latest
          severity: HIGH,CRITICAL
          exit-code: '1'
      
      - name: Show local images
        run: docker images
      
      - name: Tag frontend
        run: docker tag ef-frontend:latest ${{ secrets.DOCKERHUB_USERNAME }}/ef-frontend
      
      - name: Push frontend
        run: docker push ${{ secrets.DOCKERHUB_USERNAME }}/ef-frontend:latest

      - name: Tag backend
        run: docker tag ef-backend:latest ${{ secrets.DOCKERHUB_USERNAME }}/ef-backend

      - name: Push backend
        run: docker push ${{ secrets.DOCKERHUB_USERNAME }}/ef-backend:latest

"

unit tests + running them
templae.html to fill with tests, scans results
email sending

# Docker compose
    1- every time it run it trigger the Dockerfiles in the context: <foldername/> and create a new image
    2- give them pre installed images:

    services:
  frontend-service:
    image: myapp-frontend:latest  # Looks for this image locally or on Docker Hub
    ports:
      - "3000:3000"

my docker compose file:
"
# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Docker Compose reference guide at
# https://docs.docker.com/go/compose-spec-reference/

# Here the instructions define your application as a service called "server".
# This service is built from the Dockerfile in the current directory.
# You can add other services your application may depend on here, such as a
# database or a cache. For examples, see the Awesome Compose repository:
# https://github.com/docker/awesome-compose
services:
  frontend:
    # 1. build from the local folder
    build:
      context: Frontend
    # 2. Names the newly generated image
    image: ef-frontend:latest
    environment:
      NODE_ENV: production
    ports:
      - 3000:3000
  backend:
    build:
      context: Backend
    image: ef-backend:latest
    environment:
      # OPENROUTER_API_KEY: 
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
    ports:
      - 8000:8000
# The commented out section below is an example of how to define a PostgreSQL
# database that your application can use. `depends_on` tells Docker Compose to
# start the database before your application. The `db-data` volume persists the
# database data between container restarts. The `db-password` secret is used
# to set the database password. You must create `db/password.txt` and add
# a password of your choosing to it before running `docker-compose up`.
#     depends_on:
#       db:
#         condition: service_healthy
#   db:
#     image: postgres
#     restart: always
#     user: postgres
#     secrets:
#       - db-password
#     volumes:
#       - db-data:/var/lib/postgresql/data
#     environment:
#       - POSTGRES_DB=example
#       - POSTGRES_PASSWORD_FILE=/run/secrets/db-password
#     expose:
#       - 5432
#     healthcheck:
#       test: [ "CMD", "pg_isready" ]
#       interval: 10s
#       timeout: 5s
#       retries: 5
# volumes:
#   db-data:
# secrets:
#   db-password:
#     file: db/password.txt


"
# Backend dockerfile:

    dOCKER ENV

    cmd vs entrypoint

    use of EXPOSE

    Must use CMD [ "fastapi", "dev", "/app/main.py", "--host", "0.0.0.0"] the host option (thing to do with linux self hosting is 0.0.0.0 & windows is 127.0.0.1 || wsl?)

    ADD vs COPY

    file structure

docker file:
"
FROM python:3.13.3-slim

# ENV OPENROUTER_API_KEY = //

# SPECIFY WORKING DIRECTORY
WORKDIR /app

# copy requirements.txt and put it in the working directory (why not just not put it in .dockerignore?)
COPY requirements.txt .

# build
# --upgrade -> Upgrade all specified packages to the newest available version.
# --no-cache-dir -> disable cashing
# -r -> Install from the given requirements file. This option can be used multiple times.
# RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt  (this is the best practice)

RUN pip install -r requirements.txt

# not sure!
COPY main.py /app

EXPOSE 8000

# This line satisfies Trivy by switching to the built-in Linux 'nobody' user
USER 65534

# run
CMD [ "fastapi", "dev", "/app/main.py", "--host", "0.0.0.0"]
"
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

dockerfile:
"
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-alpine

# SPECIFY WORKING DIRECTORY
WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000


# Build the application (create compiles .next/)
RUN npm run build


# This line switches to the built-in 'node' user to satisfy Trivy
USER node


# run
# CMD [ "npm", "run", "dev", "--host", "0.0.0.0"]
# 5. Run the optimized production server
CMD ["npm", "run", "start"]
"
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
