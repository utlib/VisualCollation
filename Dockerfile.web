FROM node:14 as app

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY viscoll-app/package.json ./
COPY viscoll-app/package-lock.json ./

RUN npm ci --silent

COPY viscoll-app .

RUN npm run build

FROM ruby:2.7

# throw errors if Gemfile has been modified since Gemfile.lock
RUN bundle config --global frozen 1

WORKDIR /usr/src/app

COPY viscoll-api/Gemfile viscoll-api/Gemfile.lock ./
RUN bundle install

COPY viscoll-api .

COPY --from=app /app/build /usr/src/app/public

ENTRYPOINT ["bundle", "exec", "rails"]
CMD []
