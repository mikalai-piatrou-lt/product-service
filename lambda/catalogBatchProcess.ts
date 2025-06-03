import { SQSEvent } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { AvailableProduct } from './types';
import { createProduct } from './utils/dbOperations';

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export async function handler(event: SQSEvent) {
    const snsTopicArn = process.env.SNS_TOPIC_ARN;

    for (const record of event.Records) {
        const product: AvailableProduct = JSON.parse(record.body);
        try {
            await createProduct(product);

            await snsClient.send(new PublishCommand({
                TopicArn: snsTopicArn,
                Message: `Product ${product.title} has been created successfully.`
            }));

            console.log(`Product ${product.title} created and SNS notification sent`);
        } catch (error) {
            console.error(`Error creating product ${product.title}:`, error);
        }
    }
};