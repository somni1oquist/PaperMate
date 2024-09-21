FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy the rest of your application code to the working directory
COPY . .

EXPOSE 3000

# Build the Next.js application
RUN npm run build

# Start the Next.js application
CMD ["npm", "run", "start"]
