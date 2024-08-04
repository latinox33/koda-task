# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Define build-time variables
ARG VITE_PORT

# Set environment variables from build-time variables
ENV VITE_PORT=${VITE_PORT}

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with --legacy-peer-deps to resolve dependency issues
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the Vite development server port
EXPOSE ${VITE_PORT}

# Start the Vite server
CMD ["npm", "run", "dev"]
