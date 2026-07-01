ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-alpine

# SPECIFY WORKING DIRECTORY
WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000


# Build the application (create compiles .next/)
RUN npm run build

# run
# CMD [ "npm", "run", "dev", "--host", "0.0.0.0"]
# 5. Run the optimized production server
CMD ["npm", "run", "start"]