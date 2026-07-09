FROM node:18-alpine

WORKDIR /app

# Install all dependencies including devDependencies for build
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies to keep image small
RUN npm prune --production

EXPOSE 3001

CMD ["npm", "start"]
