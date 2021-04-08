'use strict';

const aws = require('aws-sdk');

const isLocal = require('./is-local');
const uploadResource = require('./upload-resource');
const ensureBucketExists = require('./ensure-bucket-exists');

module.exports = function packageLocalResources(params) {
  const { credentials, bucketName, blockPublicAccess, template, basedir } = params;
  const { Resources = {} } = template;

  const s3 = new aws.S3(credentials);
  const supportedResources = new Set([
    'AWS::CloudFormation::Stack',
  ]);

  const uploads = Object.values(Resources).reduce((memo, resource) => {
      const properties = resource.Properties;

      if (supportedResources.has(resource.Type)) {
        const url = properties.TemplateURL;

        if (isLocal(url)) {
          memo.push(() => {
            return uploadResource(s3, bucketName, basedir, url)
                .then(newURL => {
                  properties.TemplateURL = newURL;
                });
            });
        }
      }

      return memo;
  }, []);

  if (uploads.length > 0) {
      return ensureBucketExists(s3, bucketName, blockPublicAccess)
        .then(() => Promise.all(uploads.map(upload => upload())))
        .then(() => { template });
  }

  return Promise.resolve();
}
