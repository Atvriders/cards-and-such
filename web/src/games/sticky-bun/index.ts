import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StickyBunState, StickyBunAction, StickyBunSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StickyBunGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const stickyBunPlugin: GamePlugin<StickyBunState, StickyBunAction, typeof settings> = {
  id: "sticky-bun", title: "Sticky Bun", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Set the perfect stickiness level and toss the bun to hit the hidden sweet spot each round!",
  howToPlay: `Sticky Bun is a precision slider game. Each round has a hidden target stickiness value. Your job is to set the stickiness slider as close to the target as possible, then toss.

The closer your slider value is to the secret target, the more points you earn — up to 100 per round. Being exactly right scores full marks; being far off scores few or no points.

After each toss you see how far off you were. Use that feedback to calibrate your next attempt. The target changes every round, so you cannot rely on memory alone.

10 rounds per game. Precision and pattern recognition are your tools. The player who reads the subtle clues and adjusts most efficiently will score highest!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as StickyBunSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-sticky-bun-action"]', pulses: 3 }; },
  component: StickyBunGame,
};
