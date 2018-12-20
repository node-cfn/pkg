'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = function uploadResource(s3, bucket, dir, localFile) {
  const file = path.join(process.cwd(), dir, localFile);

  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(file);
    const hash = crypto.createHash('md5');

    rs.pipe(hash)
      .on('error', reject)
      .on('finish', () => {
        resolve(hash.read().toString('hex'));
      });
  })
  .then(hash => {
    const name = path.basename(file, path.extname(file));
    const key = `${name}-${hash}`;

    return s3.headObject({
      Bucket: bucket,
      Key: key
    })
    .promise()
    .catch(e => {
      if (e.statusCode === 404) {
        return s3.upload({
          Bucket: bucket,
          Key: key,
          Body: fs.createReadStream(file)
        })
        .promise();
      }
      throw new Error(`AWS Request Error determining if ${key} already exists in ${bucket}`);
    })
    .then(() => {
      return `https://s3.amazonaws.com/${bucket}/${key}`;
    });
  });
};