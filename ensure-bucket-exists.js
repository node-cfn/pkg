'use strict';

module.exports = function ensureBucketExists(s3, Bucket) {
    return s3.headBucket({ Bucket }).promise()
        .catch(e => {
            if (e.statusCode === 404) {
                return s3.createBucket({ Bucket }).promise();
            }

            throw new Error(`AWS Request Error determining if bucket '${Bucket}' exists`);
        });
};