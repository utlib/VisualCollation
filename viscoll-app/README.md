# VisColl (Redux Front-End)

## Introduction

This is the the Redux-driven user interface for Viscoll.

## System Requirements

- `node` (>= 6.11.4)
- `npm` (>= 3.10.10)

### Additional Requirements for Development:

- [Redux DevTools for Firefox or Chrome](https://github.com/zalmoxisus/redux-devtools-extension) (>= 2.15.1)

## Setup

Run this to install the dependencies:
```
npm install
```

Then run the dev server which brings up a browser window serving the user interface: 
```
npm start
```

## Testing

Run this command to test once:
```
npm test
```

Alternatively, run this command to test continually while monitoring for changes:
```
npm test -- --watch
```

## Building

Before building the app, edit line 3 in `viscoll-app/src/store/axiosConfig.js` to contain the correct root endpoint of the VisColl API: 

```Javascript
export let API_URL = '/api';

```

Build the app with:
```
npm build
```
