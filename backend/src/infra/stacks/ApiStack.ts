import { Stack, StackProps } from 'aws-cdk-lib'
import { AuthorizationType, CognitoUserPoolsAuthorizer, LambdaIntegration, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { AuthorizationToken } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
    spacesLambdaIntegration: LambdaIntegration,
    userPool: IUserPool;
}

export class ApiStack extends Stack {

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const api = new RestApi(this, 'CxPortalApi');

        const authorizer = new CognitoUserPoolsAuthorizer(this, 'CxPortalApiAuthorizer', {
            cognitoUserPools:[props.userPool],
            identitySource: 'method.request.header.Authorization'
        });
        authorizer._attachToApi(api);

        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            }
        }

        const CxPortalResource = api.root.addResource('CxPortal');
        CxPortalResource.addMethod('GET', props.spacesLambdaIntegration, optionsWithAuth);
        CxPortalResource.addMethod('POST', props.spacesLambdaIntegration,optionsWithAuth);
        CxPortalResource.addMethod('PUT', props.spacesLambdaIntegration, optionsWithAuth);
        CxPortalResource.addMethod('DELETE', props.spacesLambdaIntegration, optionsWithAuth);
    }
}