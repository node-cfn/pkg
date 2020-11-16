'use strict';

module.exports = function ensureBucketExists(s3, Bucket, blockPublicAccess = false) {
    return s3.headBucket({ Bucket }).promise()
        .catch(e => {
            if (e.statusCode === 404) {
                return s3.createBucket({ Bucket }).promise();
            }

            throw new Error(`AWS Request Error determining if bucket '${Bucket}' exists`);
        })
        .then(() => {
            if (blockPublicAccess === false) {
                return;
            }

            console.log('bucketock');
            return s3.putPublicAccessBlock({
                Bucket,
                PublicAccessBlockConfiguration: {
                    BlockPublicAcls: true,
                    BlockPublicPolicy: true,
                    IgnorePublicAcls: true,
                    RestrictPublicBuckets: true,
                },
            }).promise();
        });
};
