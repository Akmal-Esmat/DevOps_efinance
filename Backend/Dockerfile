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
# or can do this (but this will be on the development server -> meaning it will listen on local host of the container and cannot be binded to my laptop)
CMD [ "fastapi", "run", "/app/main.py"]