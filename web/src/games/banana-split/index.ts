import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BananaSplitState, BananaSplitAction, BananaSplitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BananaSplitGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bananaSplitPlugin: GamePlugin<BananaSplitState, BananaSplitAction, typeof settings> = {
  id: "banana-split", title: "Banana Split", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Slide a banana into the perfect split position for maximum dessert points!",
  howToPlay: `Banana Split is a sweet arcade challenge. Each round, slide the power bar to the right position and release — the banana lands somewhere on the dessert. The closer to the ideal position, the more points you earn. 10 rounds of banana tossing — perfect aim scores 100 points per round!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as BananaSplitSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-banana-split-action"]', pulses: 3 }; },
  component: BananaSplitGame,
};
