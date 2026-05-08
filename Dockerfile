FROM node:20-slim as builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/backend ./src/backend
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/middleware ./src/middleware
COPY --from=builder /app/.env.example ./.env

EXPOSE 3000

# Use tsx to run server in prod if not compiled to JS
CMD npx prisma db push --accept-data-loss && npx tsx server.ts
