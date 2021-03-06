FROM node:12-buster-slim AS base

RUN apt-get update && apt-get install --no-install-recommends --yes openssl

WORKDIR /app

### BUILDER ###
FROM base AS builder

# Install production dependencies
ADD package.json ./package.json
COPY tsconfig.json service-tsconfig.json lerna.json ./
COPY packages/common/*.json ./packages/common/
COPY services/example/*.json ./packages/example/

RUN yarn install --production --pure-lockfile

RUN cp -RL node_modules/ /tmp/node_modules/

# Install all dependencies
RUN yarn install --pure-lockfile

# Copy source files
COPY packages/common/ ./packages/common/
COPY services/example/ ./packages/example/

# Build
RUN yarn --cwd ./packages/common/ build
RUN yarn --cwd ./packages/example/ db:generate
RUN yarn --cwd ./packages/example/ build

### RUNNER ###
FROM base

# Copy runtime dependencies
COPY --from=builder /tmp/node_modules/ ./node_modules/
# COPY --from=builder /app/packages/backend/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --from=builder /app/node_modules/.prisma/client/ ./node_modules/.prisma/client/
# COPY --from=builder /app/packages/example/node_modules/.prisma/client/ ./node_modules/.prisma/client/
COPY --from=builder /app/packages/common/dist/ ./node_modules/@tuteria/common/src/

# Copy runtime project
COPY --from=builder /app/packages/example/dist/packages/example/src ./src/
COPY services/example/package.json ./
RUN mkdir logs

USER node

CMD ["node", "src/app.js"]
