FROM node:18-alpine
WORKDIR /app
# Install all dependencies to support dev (nodemon) and prod
COPY package*.json ./
RUN npm install
# Copy source
COPY src ./src
ENV NODE_ENV=development
EXPOSE 4000
# Default command can be overridden by docker-compose (uses npm run dev)
CMD ["node", "src/index.js"]
