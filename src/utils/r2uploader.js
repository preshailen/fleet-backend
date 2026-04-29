import s3 from '../config/r2.js';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function uploadToR2(file) {
  const params = {
    Bucket: 'fleet-management',
    Key: `fulfillments/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: 'inline'
  };

  const upload = await s3.send(new PutObjectCommand(params));

  return stripUrl(params.Key);
}

export async function deleteFromR2(fileUrl) {
  try {
    const params = {
      Bucket: 'fleet-management',
      Key: `fulfillments/${fileUrl}`,
    };
    await s3.send(new DeleteObjectCommand(params));
    return true;
  } catch (err) {
    console.error('Delete R2 Error:', err);
    throw err;
  }
}

export const getSignedUrlFromR2 = async (url) => {
  const command = new GetObjectCommand({
    Bucket: 'fleet-management',
    Key: `fulfillments/${url}`
  });

  const signedUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5 // 5 minutes
  });

  return signedUrl;
};

function stripUrl(url) { 
  const key = "fulfillments/";
  const index = url.indexOf(key);
  if (index === -1) { throw new Error("Error uploading quotes") } 
  return url.slice(index + key.length); 
}