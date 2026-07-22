ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-alpine

# SPECIFY WORKING DIRECTORY
WORKDIR /app

# COPY . .

# RUN npm install

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000


# Build the application (create compiles .next/)
RUN npm run build


# Give the node user permission to write to the app directory
RUN chown -R node:node /app

# This line switches to the built-in 'node' user to satisfy Trivy
USER node

# run
# CMD [ "npm", "run", "dev", "--host", "0.0.0.0"]
# 5. Run the optimized production server
CMD ["npm", "run", "start"]