
# Production Env, use stage to reduce disk size (e.g. yarn cache)
FROM node:18-alpine as prod_env
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production


# Final server
FROM node:18-alpine
WORKDIR /app

COPY --from=prod_env /app/node_modules ./node_modules/
COPY build ./build/
COPY public ./public/
COPY package.json next.config.js .env ./

CMD ["yarn", "start"]

EXPOSE 3000
