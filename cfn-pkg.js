'use strict';

const isLocal = require('./is-local');
const uploadResource = require('./upload-resource');
const ensureBucketExists = require('./ensure-bucket-exists');

module.exports = function packageLocalResources({ s3, bucketName, template, basedir }) {
  const { Resources = {} } = template;

  const uploads = Object.values(Resources).reduce((memo, resource) => {
      const properties = resource.Properties;

      if (resource.Type === 'AWS::CloudFormation::Stack') {
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
      return ensureBucketExists(s3, bucketName)
        .then(() => Promise.all(uploads.map(upload => upload())))
        .then(() => { template });
  }

  return Promise.resolve();
}
