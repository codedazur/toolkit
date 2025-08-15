# Adapted from the official example.
# @see https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:20-alpine AS base

#####################
##### INSTALLER #####
#####################
# Installs dependencies only when needed.

FROM base AS installer
WORKDIR /project

# Install dependencies.
# @see https://docs.npmjs.com/docker-and-private-modules
COPY . .
RUN --mount=type=secret,id=npmrc,required,target=/root/.npmrc npm install

###################
##### BUILDER #####
###################
# Rebuilds the source code only when needed.

FROM base AS builder
WORKDIR /project

# Copy dependencies and source code.
COPY --from=installer /project/. .

# Uncomment the following line to disable buildtime telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

# Build the source code.
WORKDIR /project/apps/next
ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build

##################
##### RUNNER #####
##################
# Copies the build artifacts and runs the Next.js server.

FROM base AS runner
WORKDIR /project

ENV NODE_ENV production

# Uncomment the following line to disable runtime telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

# Create a group and user to run the server as.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public, source and static files.
COPY --from=builder --chown=nextjs:nodejs /project/apps/next/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /project/apps/next/.next/static ./apps/next/.next/static
COPY --from=builder --chown=nextjs:nodejs /project/apps/next/public ./apps/next/public

# Switch to the correct user.
USER nextjs

# Expose the server's port.
EXPOSE 3000
ENV PORT 3000

# Run the server.
CMD node apps/next/server.js