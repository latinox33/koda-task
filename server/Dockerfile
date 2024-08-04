# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Define build-time variables
ARG SERVER_PORT

# Set environment variables from build-time variables
ENV SERVER_PORT=${SERVER_PORT}

# Install ts-node-dev globally for development
RUN npm install -g ts-node-dev

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the server port
EXPOSE ${SERVER_PORT}

# Start the server in development mode
CMD ["npm", "run", "dev"]
