# Stage 1: Build Stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine AS production

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install only production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production
RUN npm install -g nodemon

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port that your application will run on
EXPOSE 3000

# Command to run your application
CMD ["node", "dist/index.js"]
