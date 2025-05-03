# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the server code
COPY . .

# Expose port (update if your server uses a different port)
EXPOSE 8080

# Set environment variables (override in Cloud Run)
ENV NODE_ENV=production

# Start the server
CMD ["node", "index.js"]