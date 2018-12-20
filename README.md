# @cfn/pkg

Works similar to the AWS CLI (`aws cloudformation package`). You provide a root template, and it can point to other (local) CloudFormation templates. It uploads these to an S3 bucket and alters the references in the template to point to the uploaded objects.

Currently this only works for nested stacks and local resources, but could be extended to support Lambda as well as remote (but not S3) templates.

## Usage

```js
const pkg = require('@cfn/pkg');
const aws = require('aws-sdk');

const s3 = new aws.S3();
const bucket = 'some-bucket';
const template = {
    Resources: {
        SomeStack: {
            Type: 'AWS::CloudFormation::Stack'
            Properties: {
                TemplateURL: './some-local-file.json'
            }
        }
    }
};
const basedir = process.cwd();

return pkg({ s3, bucket, template, basedir })
    .then(() => {
        // this library modifies the template in-place
        // rather than making a deep copy
        // you can, of course, make your own deep copy before passing it in

        console.log(template.Resources.SomeStack.TemplateURL); // https://s3.amazonaws.com/some-bucket/...etc
    });
```