FROM node:24-alpine AS base

# pnpm
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

## Build Image
FROM base AS builder
WORKDIR /app

# node-gyp
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY /apps/server/package.json ./apps/server/
COPY /apps/client/package.json ./apps/client/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm --filter server --prod deploy ./build
RUN cp -R ./apps/client/dist ./build/public

## Server Image
FROM base AS server
WORKDIR /app

COPY --from=builder /app/build .

CMD ["sh", "-c", "node server.ts"]
