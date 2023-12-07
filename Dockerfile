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
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/
COPY --from=builder /app/prisma /app/prisma
EXPOSE 3333
ENTRYPOINT [ "npm","start" ]