import {S3Client, GetObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

const bucketName = process.env.BUCKET_NAME;
const queueUrl = process.env.QUEUE_URL;

export async function handler(event: any) {
    for (const record of event.Records) {
        try {
            const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            const response = await s3Client.send(command);

            if (!response.Body) {
                throw new Error("Empty file body");
            }

            const stream = response.Body as Readable;

            await new Promise((resolve, reject) => {
                stream
                    .pipe(csv())
                    .on("data", async (data) => {
                        const sendMessageParams = {
                            QueueUrl: queueUrl,
                            MessageBody: JSON.stringify(data),
                        };
                        console.log('Queue URL: ', queueUrl);
                        console.log('Data: ', JSON.stringify(data));

                        await sqsClient.send(new SendMessageCommand(sendMessageParams));
                    })
                    .on("end", async () => {
                        console.log('All records sent to SQS');

                        const deleteParams = {
                            Bucket: bucketName,
                            Key: key,
                        };

                        await s3Client.send(new DeleteObjectCommand(deleteParams));
                        console.log('File processed and deleted');
                    })
                    .on("error", (error) => {
                        console.error("Error parsing CSV:", error);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error(`Error processing file:`, error);
            throw error;
        }
    }
}