FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (Vite default is usually 5173, but docker-compose might override or map to 3000)
# The docker-compose uses `npm run dev -- --host` on port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
