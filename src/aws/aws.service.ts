import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";

@Injectable()
export class AwsService {

  async uploadPublicFile(file) {
    const s3 = new S3();
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Body: file.buffer,
      Key: file.originalname,
      ACL: "public-read"
    }).promise();
    return {
      key: uploadResult.Key,
      url: uploadResult.Location
    };
  }
}
