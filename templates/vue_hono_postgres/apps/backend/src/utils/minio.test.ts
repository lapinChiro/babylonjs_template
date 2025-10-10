import { describe, it, expect, beforeAll } from 'vitest';
import { generateUploadUrl, getFileMetadata } from './minio';

describe('MinIO Utils', () => {
  beforeAll(() => {
    // 環境変数をセット
    process.env.MINIO_ENDPOINT = 'minio';
    process.env.MINIO_EXTERNAL_ENDPOINT = 'localhost';
    process.env.MINIO_PORT = '9000';
    process.env.MINIO_USE_SSL = 'false';
    process.env.MINIO_ACCESS_KEY = 'minioadmin';
    process.env.MINIO_SECRET_KEY = 'minioadmin123';
    process.env.MINIO_BUCKET = 'item-images';
  });

  describe('Content-Type Validation', () => {
    it('should accept valid content types', async () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      for (const type of validTypes) {
        const result = await generateUploadUrl(`test.${type.split('/')[1]}`, type);
        expect(result).toHaveProperty('uploadUrl');
        expect(result).toHaveProperty('fileKey');
      }
    });

    it('should reject invalid content types', async () => {
      const invalidTypes = [
        'application/x-msdownload',
        'text/javascript',
        'application/pdf',
        'video/mp4'
      ];

      for (const type of invalidTypes) {
        await expect(
          generateUploadUrl('test.file', type)
        ).rejects.toThrow('Invalid content type');
      }
    });
  });

  describe('File Metadata', () => {
    it('should return exists: false for non-existent file', async () => {
      const metadata = await getFileMetadata('non-existent-file.jpg');
      expect(metadata.exists).toBe(false);
      expect(metadata.size).toBeUndefined();
      expect(metadata.contentType).toBeUndefined();
    });
  });

  describe('Filename Sanitization', () => {
    it('should extract only basename from path', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/passwd'
      ];

      for (const filename of maliciousFilenames) {
        const result = await generateUploadUrl(filename, 'image/jpeg');
        // fileKeyにパス区切り文字が含まれていないことを確認
        expect(result.fileKey).not.toContain('/');
        expect(result.fileKey).not.toContain('\\');
        expect(result.fileKey).not.toContain('..');
      }
    });
  });
});
