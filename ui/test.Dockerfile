FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production && npm cache clean --force

# Install Jest globally (to ensure it's available as a command)
RUN npm install -g jest

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Run tests with Jest
CMD ["jest", "--passWithNoTests"]
