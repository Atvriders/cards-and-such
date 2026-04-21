import { z } from "zod";

export const UsernameSchema = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, digits, hyphen, and underscore");

export type Username = z.infer<typeof UsernameSchema>;

export const ClaimRequestSchema = z.object({ username: UsernameSchema });
export const ResumeRequestSchema = z.object({ username: UsernameSchema });

export const AuthResponseSchema = z.object({
  username: UsernameSchema,
  token: z.string().min(1),
  expiresAt: z.number().int().positive(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const JwtClaimsSchema = z.object({
  sub: UsernameSchema,
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});
export type JwtClaims = z.infer<typeof JwtClaimsSchema>;
