FROM node:18-alpine AS base

#####################
##### INSTALLER #####
#####################
# Installs dependencies only when needed.
# @todo Currently doesn't leverage Docker's build caching, because the entire
# project is copied over from the host. The installer should _only_ copy the
# relevant `package.json` files and the `package-lock.json` file. However, this
# causes issues in a monorepo that contains local dependencies.

FROM base AS installer
WORKDIR /project

# Install dependencies.
# @see https://docs.npmjs.com/docker-and-private-modules
COPY . .
RUN --mount=type=secret,id=npmrc,required,target=/root/.npmrc npm ci

###################
##### BUILDER #####
###################
# Rebuilds the source code only when needed.
# @todo Currently doesn't leverage Docker's build caching, because the entire
# project is copied over from the installer. The builder should _only_ copy the
# dependencies from the installer, and _only_ the source code from the host.
# However, this causes issues in a monorepo that contains local dependencies.

FROM base AS builder
WORKDIR /project

# Copy dependencies and source code.
COPY --from=installer /project/. .

# Build the source code.
WORKDIR /project/apps/storybook
RUN npm run build

##################
##### RUNNER #####
##################
# Copies the build artifacts and runs the Nginx server.

FROM nginx:alpine AS runner

# Set the MIME type for MJS files in the Nginx configuration.
RUN echo "types { text/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf

# Copy build artifacts.
COPY --from=builder /project/apps/storybook/.storybook /usr/share/nginx/html

# Expose the server's port.
EXPOSE 80
