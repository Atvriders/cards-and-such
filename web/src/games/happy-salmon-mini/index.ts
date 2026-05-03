import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HappySalmonMiniState, HappySalmonMiniAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HappySalmonMini } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const happySalmonMiniPlugin: GamePlugin<HappySalmonMiniState, HappySalmonMiniAction, typeof settings> = {
  id: "happy-salmon-mini",
  title: "Happy Salmon Mini",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reaction party mini — match action prompts to card faces.",
  howToPlay: "Happy Salmon Mini is a quick trivia quiz with ten multiple-choice questions. Reaction party mini — match action prompts to card faces. Each question has four answer options; pick the one you think is correct.\n\nSpecial context: 10 prompts: pick action (high-five / pound-it / switcheroo / happy-salmon).\n\nClick the answer button you believe is right. The correct answer is highlighted instantly and your score updates. A correct answer earns you 100 points; incorrect answers earn nothing. After ten questions your final score is shown out of 1000.\n\nThe quiz uses a fixed bank of curated questions seeded by the run, so the order is reproducible. Replays draw from the same pool but in seeded order. Aim for a perfect score of 1000 by knowing the topic well.\n\nSingle-player only — no CPU. A great two-minute brain workout for fans of the topic. Compare scores across multiple runs to track your trivia mastery. The quiz is intentionally short for snackable play sessions, ideal for filling small breaks with focused recall practice.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-happy-salmon-mini-action"]', pulses: 3 }; },
  component: HappySalmonMini,
};
