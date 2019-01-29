'use strict';

const aws = require('aws-sdk');
const proxyquire = require('proxyquire');

const test = require('ava');
const sinon = require('sinon');

test('happy path', t => {
    const pkg = proxyquire('..', {
        './is-local': sinon.stub().returns(true),
        './upload-resource': sinon.stub().resolves(),
        './ensure-bucket-exists': sinon.stub().resolves()
    });

    const bucket = 'test';
    const template = {
        Resources: {
            Test: {
                Type: 'AWS::CloudFormation::Stack',
                Properties: {
                    TemplateURL: './test.json'
                }
            }
        }
    };
    const basedir = process.cwd();

    return pkg({ bucket, template, basedir })
        .then(() => {
            t.pass();
        });
});

test('providers credentials', t => {
    const pkg = proxyquire('..', {
        './is-local': sinon.stub().returns(true),
        './upload-resource': sinon.stub().resolves(),
        './ensure-bucket-exists': sinon.stub().resolves()
    });

    const s3 = sinon.stub(aws, 'S3');

    const bucket = 'test';
    const template = {
        Resources: {
            Test: {
                Type: 'AWS::CloudFormation::Stack',
                Properties: {
                    TemplateURL: './test.json'
                }
            }
        }
    };
    const credentials = {};
    const basedir = process.cwd();

    return pkg({ credentials, bucket, template, basedir })
        .then(() => {
            t.is(s3.callCount, 1);
            t.deepEqual(s3.firstCall.args, [credentials]);
        });
});