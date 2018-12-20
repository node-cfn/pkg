'use strict';

const fs = require('fs');
const stream = require('stream');

const test = require('ava');
const sinon = require('sinon');

const uploadResource = require('../upload-resource');

test('works when headBucket returns it exist', t => {
    const promise = sinon.stub().resolves({});

    const s3 = {
        headObject: sinon.stub().returns({ promise })
    };

    const stubStream = new stream.Readable({
        read: function() {
            this.push(JSON.stringify({ test: 'test' }))
            this.push(null);
        }
    });

    const createReadStream = sinon.stub(fs, 'createReadStream').returns(stubStream);

    return uploadResource(s3, 'test-bucket', __dirname, 'test.json')
        .then(() => {
            t.is(promise.callCount, 1);
            t.is(createReadStream.callCount, 1);
            t.deepEqual(s3.headObject.firstCall.args, [{
                Key: 'test-828bcef8763c1bc616e25a06be4b90ff',
                Bucket: 'test-bucket'
            }]);
        });
});