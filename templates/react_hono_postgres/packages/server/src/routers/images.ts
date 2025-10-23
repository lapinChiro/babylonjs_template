import { router, protectedProcedure } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db";
import { images } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  generateUploadUrl,
  generateDownloadUrl,
  getFileMetadata,
  deleteFile,
} from "../lib/minio";

// Input validation schemas
const uploadUrlRequestSchema = z.object({
  filename: z.string(),
  contentType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
});

const confirmUploadSchema = z.object({
  fileKey: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

const getImageSchema = z.object({
  id: z.number(),
});

const deleteImageSchema = z.object({
  id: z.number(),
});

export const imagesRouter = router({
  // Get all images
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allImages = await db
      .select()
      .from(images)
      .orderBy(images.createdAt);

    // Generate download URLs for each image
    const imagesWithUrls = await Promise.all(
      allImages.map(async (image) => {
        const url = await generateDownloadUrl(image.fileKey);
        return {
          ...image,
          url,
        };
      })
    );

    return imagesWithUrls;
  }),

  // Get image by ID
  getById: protectedProcedure
    .input(getImageSchema)
    .query(async ({ input }) => {
      const [image] = await db
        .select()
        .from(images)
        .where(eq(images.id, input.id))
        .limit(1);

      if (!image) {
        throw new Error("Image not found");
      }

      const url = await generateDownloadUrl(image.fileKey);
      return {
        ...image,
        url,
      };
    }),

  // Request upload URL
  requestUploadUrl: protectedProcedure
    .input(uploadUrlRequestSchema)
    .mutation(async ({ input }) => {
      const { uploadUrl, fileKey, expiresIn } = await generateUploadUrl(
        input.filename,
        input.contentType,
        input.size
      );

      return {
        uploadUrl,
        fileKey,
        expiresIn,
      };
    }),

  // Confirm upload and save metadata to DB
  confirmUpload: protectedProcedure
    .input(confirmUploadSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify file exists in MinIO
      const metadata = await getFileMetadata(input.fileKey);

      // Double-check file size
      if (metadata.size !== input.size) {
        throw new Error("File size mismatch");
      }

      // Save metadata to database
      const [newImage] = await db
        .insert(images)
        .values({
          fileKey: input.fileKey,
          originalName: input.originalName,
          mimeType: input.mimeType,
          size: input.size,
          userId: ctx.session.user.id,
        })
        .returning();

      // Generate download URL
      const url = await generateDownloadUrl(newImage.fileKey);

      return {
        ...newImage,
        url,
      };
    }),

  // Delete image
  delete: protectedProcedure
    .input(deleteImageSchema)
    .mutation(async ({ input }) => {
      // Get image from database
      const [image] = await db
        .select()
        .from(images)
        .where(eq(images.id, input.id))
        .limit(1);

      if (!image) {
        throw new Error("Image not found");
      }

      // Delete from MinIO
      await deleteFile(image.fileKey);

      // Delete from database
      await db.delete(images).where(eq(images.id, input.id));

      return { success: true };
    }),
});
