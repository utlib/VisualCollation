<img src="https://digitaltoolsmss.library.utoronto.ca/sites/digitaltoolsmss.library.utoronto.ca/files/viscoll-dark.svg" width="500px" />

## Introduction

VisColl is for building models of the physical collation of manuscripts, and then visualizing them in various ways. The VisColl project is led by Dot Porter at the [Schoenberg Institute for Manuscript Studies](https://schoenberginstitute.org/) at the University of Pennsylvania, in collaboration with the [University of Toronto Libraries](https://onesearch.library.utoronto.ca/about) and the [Old Books New Science lab](https://oldbooksnewscience.com/). Collaborators include Alexandra Gillespie, Alberto Campagnolo, and Conal Tuohy.

## System Requirements

- `rvm` (>= 1.29.1)
- `ruby` (>= 2.4.1)
- `node` (>= 6.11.4)
- `npm` (>= 3.10.10)

### Additional Requirements for Development:

- [`mailcatcher`](https://mailcatcher.me/) (>= 0.6.5)
- [Redux DevTools for Firefox or Chrome](https://github.com/zalmoxisus/redux-devtools-extension) (>= 2.15.1)

## Installation and Setup

### Viscoll API (Rails)

Rails-driven back-end for Viscoll

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

### Viscoll App (React-Redux)

Redux-driven user interface for Viscoll

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

Before building the app, edit line 3 in `viscoll-app/src/store/axiosConfig.js` to contain the correct root endpoint of the VisColl API: 

```Javascript
export let API_URL = '/api';

```

Build the app with:
```
npm build
```


## Copyright and License

Copyright 2018 University of Toronto Libraries

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
