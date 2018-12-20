'use strict';

const test = require('ava');
const sinon = require('sinon');

const ensureBucketExists = require('../ensure-bucket-exists');

test('works when headBucket returns it exist', t => {
    const promise = sinon.stub().resolves({});

    const s3 = {
        headBucket: sinon.stub().returns({ promise }),
    };

    return ensureBucketExists(s3, 'test-bucket')
        .then(() => {
            t.is(promise.callCount, 1);
            t.deepEqual(s3.headBucket.firstCall.args, [{ Bucket: 'test-bucket' }]);
        });
});

test('creates bucket when headBucket returns 404', t => {
    const headBucketPromise = sinon.stub().rejects({ statusCode: 404 });
    const createBucketPromise = sinon.stub().resolves();

    const s3 = {
        headBucket: sinon.stub().returns({ promise: headBucketPromise }),
        createBucket: sinon.stub().returns({ promise: createBucketPromise })
    };

    return ensureBucketExists(s3, 'test-bucket')
        .then(() => {
            t.is(headBucketPromise.callCount, 1);
            t.is(createBucketPromise.callCount, 1);
            t.deepEqual(s3.createBucket.firstCall.args, [{ Bucket: 'test-bucket' }]);
        });
});

test('rejects when headBucket returns non-404', t => {
    const headBucketPromise = sinon.stub().rejects({ statusCode: 403 });
    const createBucketPromise = sinon.stub().resolves();

    const s3 = {
        headBucket: sinon.stub().returns({ promise: headBucketPromise }),
        createBucket: sinon.stub().returns({ promise: createBucketPromise })
    };

    return ensureBucketExists(s3, 'test-bucket')
        .then(() => {
            t.fail('should not reach here');
        })
        .catch(e => {
            t.is(e.message, `AWS Request Error determining if bucket 'test-bucket' exists`);
        });
});