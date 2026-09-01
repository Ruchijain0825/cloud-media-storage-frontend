import { z } from "zod";

export const folderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be less than 100 characters"),
});