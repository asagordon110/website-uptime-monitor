# Runs the Express backend.
FROM node:20-alpine

# Sets working directory inside container.
WORKDIR /app

# Copies package files first for better Docker caching.
COPY package*.json ./

# Installs backend dependencies.
RUN npm install

# Copies backend source code.
COPY . .

# Exposes Express port.
EXPOSE 3000

# Starts the backend.
CMD ["npm", "start"]