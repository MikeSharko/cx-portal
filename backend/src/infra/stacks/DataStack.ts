import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../Utils';
import { Bucket, BucketAccessControl, HttpMethods, IBucket } from 'aws-cdk-lib/aws-s3';


export class DataStack extends Stack {

    public readonly spacesTable: ITable
    public readonly deploymentBucket: IBucket;
    public readonly usersBucket: IBucket;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = getSuffixFromStack(this);

        
        // this will create additional bucket
        // this.usersBucket = new Bucket(this, 'SpaceFinderPhotos', {
        //     bucketName: `nga-portal-users-${suffix}`,
      
        // });
        // new CfnOutput(this, 'nga-portal-usersName', {
        //     value: this.usersBucket.bucketName
        // });

          // this will deploy a DynamoDb table
        this.spacesTable = new Table(this, 'NGATable', {
            partitionKey : {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: `NGATable-${suffix}`
        })
    }
}