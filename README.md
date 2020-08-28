## Introduction

VisCodex is for building models of the physical collation of manuscripts, and then visualizing them in various ways. The VisCodex project is led by Dot Porter at the [Schoenberg Institute for Manuscript Studies](https://schoenberginstitute.org/) at the University of Pennsylvania, in collaboration with the [University of Toronto Libraries](https://onesearch.library.utoronto.ca/about) and the [Old Books New Science lab](https://oldbooksnewscience.com/). Collaborators include Alexandra Gillespie, Alberto Campagnolo, and Conal Tuohy.

## System Requirements

- `rvm` (>= 1.29.1)
- `ruby` (>= 2.4.1)
- `node` (>= 6.11.4)
- `npm` (>= 3.10.10)

### Additional Requirements for Development:

- [`mailcatcher`](https://mailcatcher.me/) (>= 0.6.5)
- [Redux DevTools for Firefox or Chrome](https://github.com/zalmoxisus/redux-devtools-extension) (>= 2.15.1)

## Development setup with Docker

Instead of manually installing the dependencies locally on your machine for development, you can use Docker with the provided Dockerfile and docker-compose.yml.

Update the mongo host name on line 12 in `viscoll-api/config/mongoid.yml` from `localhost` to `mongo` (this is the Docker service name defined in docker-compose.yml).

Bring up the containers with:

```
docker-compose up
```

To access emails being sent by the app (for user account activation, password reset, etc), set up Ethereal with the following credentials:

```
:user_name => 'libby.corkery17@ethereal.email',
:password => 'RP4P6zMm3rVW9adMZF'
```

This configuration is located at `viscoll-api/config/environments/development.rb`.

## Deploying with Docker Swarm and Traefik

To deploy the application with Docker Swarm using Traefik, first deploy the Traefik stack by running the following command:

```
docker stack deploy -c docker-compose.traefik.yml traefik
```

Before running the project you will need to set the environment variable `PROJECT_URL` to the URL you are using (e.g. `export PROJECT_URL=my-viscoll-url.com`). Then deploy the project:

```
docker stack deploy -c docker-compose.yml viscoll
```

#### Other required environment variables

Set in the ENV the following:

* `MAILER_USR` -- the SMTP account to use (if needed)
* `MAILER_PWD` -- the password of of the SMTP account (if needed)
* `MAILER_DEFAULT_FROM` -- the default mail from account
* `MAILER_HOST` -- the SMTP host
* `MAILER_DOMAIN` -- the application host (e.g., `my-app.com`)
* `PROJECT_URL` -- the application host; used by Traefik
* `RELEASE_TAG` -- the release tag of the docker image (e.g., `lastest`)
* `ADMIN_EMAIL` -- the mailto address for admin emails
* `APPLICATION_HOST` -- the application host; used by VCEditor
* `SECRET_KEY_BASE` -- the Rails secrect key base
* `RAILS_ENV` -- 'production', if deploying to staging or production
                  environments
* `XPROC_URL` -- full URL to the xproc service; e.g., `http://host.com:<PORT>`

## Installation and Setup

Skip this section if you are using Docker for development.

### VisCodex API (Rails)

Rails-driven back-end for VisCodex

#### System Requirements

- `rvm` (>= 1.29.1)
- `ruby` (>= 2.4.1)

##### Additional Requirements for Development:

- [`mailcatcher`](https://mailcatcher.me/) (>= 0.6.5)

#### Setup

Run the following commands to install the dependencies:

```
rvm --ruby-version use 2.4.1@viscollobns
bundle install
```

Set the admin email address in two locations:

`viscoll-api/app/mailers/mailer.rb` on line 18:

```
toEmail = Rails.application.secrets.admin_email || "dummy-admin@library.utoronto.ca"
```

and `viscoll-api/app/mailers/feedback_mailer.rb` on line 10:

```
to:"utlviscoll@library.utoronto.ca",
```

Then run this to start the API server:

```
rails s -p 3001
```

If you wish to receive confirmation and password reset emails while developing, also start the mailcatcher daemon:

```
mailcatcher
```

#### Testing

Run this command to test once:

```
rspec
```

Alternatively, run this command to test continually while monitoring for changes:

```
guard
```

### VisCodex App (React-Redux)

Redux-driven user interface for VisCodex

#### System Requirements

- `node` (>= 6.11.4)
- `npm` (>= 3.10.10)

##### Additional Requirements for Development:

- [Redux DevTools for Firefox or Chrome](https://github.com/zalmoxisus/redux-devtools-extension) (>= 2.15.1)

#### Setup

Run this to install the dependencies:

```
npm install
```

Then run the dev server which brings up a browser window serving the user interface:

```
npm start
```

#### Testing

Run this command to test once:

```
npm test
```

Alternatively, run this command to test continually while monitoring for changes:

```
npm test -- --watch
```

#### Building

Before building the app, edit line 3 in `viscoll-app/src/store/axiosConfig.js` to contain the correct root endpoint of the VisCodex API:

```Javascript
export let API_URL = '/api';

```

Build the app with:

```
npm build
```

## Copyright and License

Copyright 2020 University of Toronto Libraries

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
