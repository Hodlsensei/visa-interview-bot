FROM node:18-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm install

# Copy all source code
COPY . .

# Build the frontend
RUN npm run build

# Clean up dev dependencies to reduce image size (optional)
RUN npm prune --production

# Expose port
EXPOSE 8000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]