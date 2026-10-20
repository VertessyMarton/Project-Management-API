FROM node:24-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:24-alpine AS backend-build
WORKDIR /api
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /api
COPY --from=backend-build --chown=node:node /api/package*.json ./
COPY --from=backend-build --chown=node:node /api/node_modules ./node_modules
COPY --from=backend-build --chown=node:node /api/dist ./dist
COPY --from=frontend-build --chown=node:node /frontend/dist/sakai-ng/browser ./public
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
