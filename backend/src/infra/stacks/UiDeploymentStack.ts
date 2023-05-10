import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { CloudFrontWebDistribution, Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, BucketAccessControl, HttpMethods, IBucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { existsSync } from "fs";
import { join } from "path";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { getSuffixFromStack } from "../Utils";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";

interface UiDeploymentStackProps extends StackProps {
    deploymentBucket: IBucket;
}

export class UiDeploymentStack extends Stack {

    constructor(scope: Construct, id: string, props: UiDeploymentStackProps) {
        super(scope, id, props);
        const suffix = getSuffixFromStack(this)
        //name of the bucket that is going to be deployed
        const deploymentBucket = new Bucket(this, 'uiDeploymentBucket', {
            bucketName: `nga-bucket-frontend-${suffix}`,
            cors: [{
                allowedMethods: [
                    HttpMethods.HEAD,
                    HttpMethods.GET,
                    HttpMethods.PUT

                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*']
            }],
            // accessControl: BucketAccessControl.PUBLIC_READ
            blockPublicAccess :{
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false
            }

        })

        //destination to the frontend folder
        const uiDir = join(__dirname, '..', '..', '..', '..', 'frontend', 'dist', 'frontend');
        if (!existsSync(uiDir)) {
            console.warn('UI dir not found' + uiDir)
            return;
        }

        new BucketDeployment(this, 'nga-s3-bucket', {
            destinationBucket: deploymentBucket,
            sources: [Source.asset(uiDir)]
        })

        // we need origin Identity that can read from the bucket
        const originIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity')
        deploymentBucket.grantRead(originIdentity)

        //the right to destribution to read from deployment bucket
        const distribution = new Distribution(this, 'nga-distribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new S3Origin(deploymentBucket, {
                    originAccessIdentity: originIdentity,

                })
            }
        })
        //Cloud Front distribution will read the data from Buckets
        new CfnOutput(this, 'cx-portal-ui-deploymentS3Url', {
            value: distribution.distributionDomainName
        })
 
    }
}

