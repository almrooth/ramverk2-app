# Chat application for the course "ramverk2" at BTH

* Circle CI

* Scrutinizer

## Tech Stack
* Express.js server / REST API
* Client ???

## Setup
1. Clone the repo
```
$ git clone https://github.com/almrooth/ramverk2-app.git 
```
2. Install dependencies
```
$ npm install
```
3. Run server
```
$ npm start
```
4. Open in browser `http://localhost:3000`

## Testing
Tests available for app: 
* eslint `npm run eslint`
* stylelint `npm run stylelint`

To Run all tests
```
npm test
```

### Docker
The app can be tested in 3 different docker containers / environments

* Node Alpine latest `npm run test1`
* Node Alpine 8 `npm run test2`
* Node Alpine 7 `npm run test3`
