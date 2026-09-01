import { z } from "zod";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => ALLOWED_TYPES.includes(file.type),
      "Only images, PDF and text files are allowed."
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 10 MB."
    ),
});