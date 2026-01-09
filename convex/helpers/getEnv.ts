import { z } from "zod/v4";

const envSchema = z.object({
  ADMIN: z
    .string()
    .transform((s) => (s ? s.split(",") : []))
    .pipe(z.array(z.string())),
});

export const getEnv = () => {
  // Parse and validate environment variables
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
};

export type EnvConvex = z.infer<typeof envSchema>;
