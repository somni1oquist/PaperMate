FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install dependencies, including test and dev dependencies
RUN npm install && npm install jest --save-dev && npm cache clean --force

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Run tests with Jest
CMD ["npm", "run", "test"]
