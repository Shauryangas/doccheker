import { z } from "zod";

export const VisionArtifactSchema = z.object({
  findings: z.array(
    z.object({
      category: z.enum(["anatomy", "lighting", "texture", "text", "object"]),
      issue: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"])
    })
  )
});
