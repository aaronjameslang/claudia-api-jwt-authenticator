# 🎟️ claudia-api-jwt-authenticator [![Build Status](https://travis-ci.org/aaronjameslang/claudia-api-jwt-authenticator.svg?branch=master)](https://travis-ci.org/aaronjameslang/claudia-api-jwt-authenticator)

[![Maintainability](http://api.codeclimate.com/v1/badges/be9063c2403a481deaf3/maintainability)](//codeclimate.com/github/aaronjameslang/claudia-api-jwt-authenticator/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/be9063c2403a481deaf3/test_coverage)](//aaronjameslang.com/claudia-api-jwt-authenticator/coverage)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/aaronjameslang/claudia-api-jwt-authenticator/master)](https://stryker-mutator.github.io)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/aaronjameslang/claudia-api-jwt-authenticator/badges/quality-score.png)](//scrutinizer-ci.com/g/aaronjameslang/claudia-api-jwt-authenticator)
[![Known Vulnerabilities](http://snyk.io/test/github/aaronjameslang/claudia-api-jwt-authenticator/badge.svg)](//snyk.io/test/github/aaronjameslang/claudia-api-jwt-authenticator)
[![Greenkeeper badge](https://badges.greenkeeper.io/aaronjameslang/claudia-api-jwt-authenticator.svg)](https://greenkeeper.io/)

Easily verify and read [JWTs](https://jwt.io/) with [Claudia](https://github.com/claudiajs/claudia-api-builder)

## Installation [![npm version](https://badge.fury.io/js/claudia-api-jwt-authenticator.svg)](//npmjs.com/package/claudia-api-jwt-authenticator)

```shell
npm i claudia-api-jwt-authenticator
```

## Usage

### authenticate

The `authenticate` function takes a key (public or secret), a promised key, or an async function (promise or callback).

#### with a public key
```js
const ApiBuilder = require("claudia-api-builder");
const { authenticate } = require("claudia-api-jwt-authenticator");

// Begin by creating your Api Builder as normal
const api = new ApiBuilder();

// Next pass in the authenticator along with your key
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAry0bg77WbExsds8R4eJo
fNqbeWnu1QqRqG0wOk35JenMXDU6mCfUFas0ANgS/2PhxOoem5dtxKpJEzXF8eQh
xrO3J9zD9HMbLVMfodpG9Up9u+AUICGvMCAbAuCHcp7vTZtc+OmmSyk5qF1ApGnU
rWromBB8TDFVx0UdOR6I+1F3DvIk7mgjLAhwzycgsLRZFwXxS2mwHVAafD6QYbxZ
I655+ltaf3Gb3CBJSz888i3DfaKT30cCC/7r3rnOqbKjUcG8qxrsp+yOo8l6BeeJ
g57ITeuaRrSza7zdvS0Vydp9RS7VS9JdHQv9b48b7rsx+WLghI/AQ3kK0Xg85C9R
TQIDAQAB
-----END PUBLIC KEY-----`;
api.intercept(authenticate(PUBLIC_KEY));

// Register your routes as normal
api.get("/greeting", event => `Hello ${event.jwt.payload.name}!`);

exports.handler = api.proxyRouter
```

#### with a secret key
```js
const ApiBuilder = require("claudia-api-builder");
const SecretsManager = require("aws-sdk/clients/secretsmanager");
const { authenticate } = require("claudia-api-jwt-authenticator");

// Begin by creating your Api Builder as normal
const api = new ApiBuilder();

// Next pass in the authenticator along with your key function
// Here we use AWS, but you can fetch your key from anywhere
const getSecret = (header, callback) =>
  new SecretsManager({region})
    .getSecretValue({SecretId})
    .promise()
    .then(({SecretString}) => JSON.parse(SecretString))
    .then(({secretKey}) => Buffer.from(secretKey, 'base64'))
 
api.intercept(authenticate(getSecret));

// Register your routes as normal
api.get("/greeting", event => `Hello ${event.jwt.payload.name}!`);

exports.handler = api.proxyRouter
```

### authorise


#### with roles

If you are using role based auth and want to check against an array of
roles in the token you can use the below example.

Use `withRoles` before authenticating to specify a function which will
extract the roles from the token. Customise this based on the structure
of your token.

Use `authoriseRoles` within your route handler to ensure that the user has
the correct roles.

```js
const ApiBuilder = require("claudia-api-builder");
const { withRoles, authoriseRoles } = require("claudia-api-jwt-authenticator");

const api = new ApiBuilder();

api.intercept(withRoles(jwt => jwt.payload.roles).authenticate(PUBLIC_KEY));

api.get("/billing", ({ jwt }) => {
  authoriseRoles(jwt, 'superuser', 'admin')
  return `Hello ${jwt.payload.name}!`
});
```

#### with custom authorisation

The `authorise` method (and an alias `authorize`) takes a boolean, a promised boolean, or a function that returns a boolean or promised boolean. You can use this to specify custom auth logic.

```js
const { authorise } = require("claudia-api-jwt-authenticator");

api.get("/greeting", ({ jwt }) => {
  authorise(jwt.payload.roles.includes('superuser'))
  return `Hello Superuser ${jwt.payload.name}`
})
```
```js
const { authorise } = require("claudia-api-jwt-authenticator");

const canViewAccount = ({ jwt, pathParams }) =>
  getDatabase().then(db =>
    db.userCanViewAccount(jwt.payload.userId, pathParams.number)
  )

api.get("/account/{number}", ({ jwt, pathParams }) => {
  authorise(canViewAccount)
  return getAccountInfo(pathParams.number)
})
```


See the tests for more examples of what you can and shouldn't do

## Contribution & Feedback [![Gitter](http://badges.gitter.im/claudia-api-jwt-authenticator.svg)](//gitter.im/claudia-api-jwt-authenticator) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg)](https://conventionalcommits.org)

Question? Bug? Feature request? Not sure? [Open an issue!](//github.com/aaronjameslang/claudia-api-jwt-authenticator/issues/new)

If this is *almost* what you were looking for, let me know and I can probably help!

Pull requests welcome, but please get in touch first. I don't want to waste your time 😁

See the code on [GitHub](//github.com/aaronjameslang/claudia-api-jwt-authenticator)
