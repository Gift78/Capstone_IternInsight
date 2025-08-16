import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { config } from './config';
import { BufferedFile } from './file.model';
import * as crypto from 'crypto';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket = config.MINIO_BUCKET;

  public get client(): any {
    return this.minio.client;
  }

  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioStorageService');
  }

  public async upload(
    file: BufferedFile,
    baseBucket: string = this.baseBucket,
  ) {
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }

    const temp_filename = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(temp_filename)
      .digest('hex');
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
    const filename = `${hashedFileName}${ext}`;

    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Testing': '1234',
    };

    try {
      await this.client.putObject(
        baseBucket,
        filename,
        file.buffer,
        file.buffer.length,
        metaData,
      );
    } catch (err) {
      this.logger.error('Upload error', err);
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }

    return {
      url: `${config.MINIO_ENDPOINT}:${config.MINIO_PORT}/${config.MINIO_BUCKET}/${filename}`,
    };
  }

  async delete(objectName: string, baseBucket: string = this.baseBucket) {
    try {
      await this.client.removeObject(baseBucket, objectName);
    } catch (err) {
      this.logger.error('Delete error', err);
      throw new HttpException(
        'Oops Something went wrong',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
