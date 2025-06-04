import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

const userEnv = process.env.USER;
const passwordEnv = process.env.PASSWORD;

export async function handler(event: APIGatewayTokenAuthorizerEvent) {
    const { authorizationToken } = event;

    if (!authorizationToken) {
        return generatePolicy('user', 'Deny', event.methodArn, 401);
    }

    const token = authorizationToken.split(' ')[1];
    const decodedToken = Buffer.from(token, 'base64').toString('utf8').split(':');
    const [username, password] = decodedToken;

    if (username === userEnv && password === passwordEnv) {
        return generatePolicy(username, 'Allow', event.methodArn, 200);
    } else {
        return generatePolicy(username, 'Deny', event.methodArn, 403);
    }
}

const generatePolicy = (principalId: string, effect: string, resource: string, statusCode: number) => {
    const policyDocument = {
        Version: '2012-10-17',
        Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource,
            },
        ],
    };

    return {
        principalId,
        policyDocument,
        context: {
            statusCode,
        },
    };
};