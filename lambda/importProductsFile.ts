import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HEADERS } from "./utils";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function handler(event: any) {
    const bucketName = process.env.BUCKET_NAME;
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing file name' }),
            headers: HEADERS
        };
    }

    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: `uploaded/${fileName}`,
            ContentType: 'text/csv',
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: signedUrl }),
            headers: HEADERS
        };
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to generate signed URL' }),
            headers: HEADERS
        };
    }
}