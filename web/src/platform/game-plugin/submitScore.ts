import { useAuth } from "../stores/auth.js";
import { hashSettings } from "./hashSettings.js";
import { ScoreSubmitSchema } from "@cards/shared";

export async function submitScore(gameId: string, score: number, settings: Record<string, unknown>): Promise<void> {
  const token = useAuth.getState().token;
  if (!token) return;
  const body = ScoreSubmitSchema.parse({ gameId, score, settingsHash: hashSettings(settings) });
  await fetch("/api/scores", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}
