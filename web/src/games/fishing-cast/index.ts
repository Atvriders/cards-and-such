import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FishingCastState, FishingCastAction, FishingCastSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FishingCast } from "./Game.js";

const fishingCastSettings = {
  casts: { kind: "enum" as const, label: "Casts", options: ["5", "8"] as const, default: "5" as const },
} as const;

type FishingCastSettingsType = SettingsOf<typeof fishingCastSettings>;

export const fishingCastPlugin: GamePlugin<FishingCastState, FishingCastAction, typeof fishingCastSettings> = {
  id: "fishing-cast",
  title: "Fishing Cast",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch the power meter fill and release at just the right moment to land your lure in the target zone!",
  howToPlay: `Fishing Cast is a power-timing arcade game. A power bar fills up from left to right, cycling back to zero if you wait too long. A highlighted green zone marks where you want to land your cast.

Press Cast when the power indicator is inside the green zone to score 100 points. If you're close to the zone but not quite in it, you still score some consolation points. A really wide miss scores zero.

The target zone moves to a different position each cast, and the fill speed varies — keeping you on your toes. Read the zone location before acting.

You have 5 or 8 casts per game (use Settings to choose). Your final score is the total of all your casts. A perfect game scores 500 or 800 points.

Watch the power meter carefully, anticipate when it enters the green zone, and release at exactly the right moment. Precise timing beats fast clicking every time!`,
  settings: fishingCastSettings,
  initialState: (seed: number, settings: FishingCastSettingsType) => initialState(seed, settings as FishingCastSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-fishing-cast-action"]', pulses: 3 }; },
  component: FishingCast,
};
