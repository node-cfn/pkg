'use strict';

const test = require('ava');
const sinon = require('sinon');

const isLocal = require('../is-local');

test('identifies relative as local', t => {
    t.is(isLocal('./test/foo'), true);
});

test('identifies absolute as local', t => {
    t.is(isLocal('/test/foo'), true);
});

test('identifies s3 as remote', t => {
    t.is(isLocal('https://s3.amazonaws.com/meme'), false);
});