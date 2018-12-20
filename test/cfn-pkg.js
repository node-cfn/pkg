'use strict';

const proxyquire = require('proxyquire');

const test = require('ava');
const sinon = require('sinon');

test('happy path', t => {
    const pkg = proxyquire('..', {
        './is-local': sinon.stub().returns(true),
        './upload-resource': sinon.stub().resolves(),
        './ensure-bucket-exists': sinon.stub().resolves()
    });

    const s3 = sinon.stub();
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

    return pkg({ s3, bucket, template, basedir })
        .then(() => {
            t.pass();
        });
});