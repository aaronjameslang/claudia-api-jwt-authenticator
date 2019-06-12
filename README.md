# 🎟️ claudia-api-jwt-authenticator [![Build Status](https://travis-ci.org/aaronjameslang/claudia-api-jwt-authenticator.svg?branch=master)](https://travis-ci.org/aaronjameslang/claudia-api-jwt-authenticator)

[![Maintainability](http://api.codeclimate.com/v1/badges/be9063c2403a481deaf3/maintainability)](//codeclimate.com/github/aaronjameslang/claudia-api-jwt-authenticator/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/be9063c2403a481deaf3/test_coverage)](//aaronjameslang.com/claudia-api-jwt-authenticator/coverage)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/aaronjameslang/claudia-api-jwt-authenticator/master)](https://stryker-mutator.github.io)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/aaronjameslang/claudia-api-jwt-authenticator/badges/quality-score.png)](//scrutinizer-ci.com/g/aaronjameslang/claudia-api-jwt-authenticator)
[![Known Vulnerabilities](http://snyk.io/test/github/aaronjameslang/claudia-api-jwt-authenticator/badge.svg)](//snyk.io/test/github/aaronjameslang/claudia-api-jwt-authenticator)

Easily verify and read [JWTs](https://jwt.io/) with [Claudia](https://github.com/claudiajs/claudia-api-builder)

## Installation [![npm version](https://badge.fury.io/js/claudia-api-jwt-authenticator.svg)](//npmjs.com/package/claudia-api-jwt-authenticator)

```shell
  npm i claudia-api-jwt-authenticator
```

## Usage

### with a public key
```js
const ApiBuilder = require("claudia-api-builder");
const authenticator = require("claudia-api-jwt-authenticator");

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
api.intercept(authenticator(PUBLIC_KEY));

// Register your routes as normal
api.get("/greeting", evnt => `Hello ${evnt.jwt.payload.name}!`);

exports.handler = api.proxyRouter
```

### with a secret key
```js
const ApiBuilder = require("claudia-api-builder");
const SecretsManager = require("aws-sdk/clients/secretsmanager");
const authenticator = require("claudia-api-jwt-authenticator");

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
 
api.intercept(authenticator(getSecret));

// Register your routes as normal
api.get("/greeting", evnt => `Hello ${evnt.jwt.payload.name}!`);

exports.handler = api.proxyRouter
```

See the tests for more examples of what you can and shouldn't do

## Contribution & Feedback [![Gitter](http://badges.gitter.im/claudia-api-jwt-authenticator.svg)](//gitter.im/claudia-api-jwt-authenticator) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg)](https://conventionalcommits.org)

Question? Bug? Feature request? Not sure? [Open an issue!](//github.com/aaronjameslang/claudia-api-jwt-authenticator/issues/new)

If this is *almost* what you were looking for, let me know and I can probably help!

Pull requests welcome, but please get in touch first. I don't want to waste your time 😁

See the code on [GitHub](//github.com/aaronjameslang/claudia-api-jwt-authenticator)
