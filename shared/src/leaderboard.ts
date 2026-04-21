import { z } from "zod";
import { UsernameSchema } from "./auth.js";

export const GameIdSchema = z.string().regex(/^[a-z][a-z0-9-]{1,31}$/);
export type GameId = z.infer<typeof GameIdSchema>;

export const LeaderboardRowSchema = z.object({
  rank: z.number().int().positive(),
  username: UsernameSchema,
  score: z.number().int(),
  playedAt: z.number().int().positive(),
});
export type LeaderboardRow = z.infer<typeof LeaderboardRowSchema>;

export const GlobalLeaderboardRowSchema = z.object({
  rank: z.number().int().positive(),
  username: UsernameSchema,
  gamesPlayed: z.number().int().nonnegative(),
});
export type GlobalLeaderboardRow = z.infer<typeof GlobalLeaderboardRowSchema>;

export const ScoreSubmitSchema = z.object({
  gameId: GameIdSchema,
  score: z.number().int(),
  settingsHash: z.string().length(8),
});
export type ScoreSubmit = z.infer<typeof ScoreSubmitSchema>;
