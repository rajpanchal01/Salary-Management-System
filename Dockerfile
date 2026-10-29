# Single-image deploy: React is built once, then served by Rails from /public.
FROM node:22-slim AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM ruby:3.3.1-slim
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libyaml-dev pkg-config sqlite3 libsqlite3-dev curl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives
WORKDIR /rails
ENV RAILS_ENV=production BUNDLE_DEPLOYMENT=1 BUNDLE_WITHOUT=development:test RAILS_LOG_TO_STDOUT=1
COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle install
COPY backend/ ./
COPY --from=web /web/dist ./public
RUN mkdir -p storage log tmp
EXPOSE 3000
HEALTHCHECK CMD curl -fs http://localhost:${PORT:-3000}/up || exit 1
CMD ["bin/boot"]
