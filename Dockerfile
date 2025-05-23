# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:22.15.0@sha256:a1f1274dadd49738bcd4cf552af43354bb781a7e9e3bc984cfeedc55aba2ddd8 AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn --immutable --immutable-cache


FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --exclude=.yarn/cache . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN ./bin/build.sh

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R node:node /app
USER node

EXPOSE 3000
ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js
