FROM node:current-alpine as base
RUN mkdir -p /app

FROM base AS builder
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY . .
RUN npm run gen:prisma
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist /app/
EXPOSE 3333
ENTRYPOINT [ "node","./main.js" ]