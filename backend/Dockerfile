# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy prisma schema to generate client
COPY prisma ./prisma/

# Generate prisma client
RUN npx prisma generate

# Copy the rest of your application's source code
COPY . .

# Build TypeScript code
RUN npm run build

# Your app binds to port 3000, so expose it
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "start" ] 