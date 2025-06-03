const FRONTEND_URL = 'https://d31cdo0fo49iqu.cloudfront.net';

export const HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `${FRONTEND_URL}`,
    'Access-Control-Allow-Headers': "*",
    'Access-Control-Allow-Methods': "*",
};

export const CORS_OPTIONS = {
    allowOrigins: [FRONTEND_URL],
    allowMethods: ['*'],
    allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
}