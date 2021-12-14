import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { v4 as uuid } from "uuid";

const sharp = require("sharp");

@Injectable()
export class AwsService {

  async uploadPublicFile(file) {
    const s3 = new S3({
      endpoint: process.env.AWS_LINK,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Body: file.fieldname === "avatar" ? await sharp(file.buffer).resize(256, 256).toBuffer() : file.buffer,
      Key: `${uuid()}/${file.originalname}`,
      ACL: "public-read"
    }).promise();


    return {
      key: uploadResult.Key.split("/")[1],
      url: uploadResult.Location
    };
  }
}
