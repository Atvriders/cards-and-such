import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { cartographersNequeState, cartographersNequeAction, cartographersNequeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { cartographersNequeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographersNequePlugin: GamePlugin<cartographersNequeState, cartographersNequeAction, typeof settings> = {
  id: "cartographers-neque",
  title: "Cartographers: Neque Maps",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Community-expansion custom Cartographers maps — flip and draw on alternative grids.",
  howToPlay: "Cartographers: Neque Maps is a community-expansion roll-and-write featuring custom map sheets distilled into a 4x4 grid. Each turn flips a season card and gives you a number 1-6 to write into any open cell.\n\nPress Roll to flip the next card. Click any unmarked cell to inscribe the value there, scoring 2 points per cell. The game lasts twelve turns; you'll fill at most twelve of sixteen squares on a perfect run.\n\nFull rows and columns each earn +5 bonus, and a complete map (all sixteen cells filled) adds a +10 Cartographers bonus. Skip a turn to pass — cost-free, but it consumes one of twelve precious flips.\n\nThe original Neque Maps adds five new player sheets with reshaped scoring zones; this version preserves the flip-and-draw loop while smoothing scoring into universal row/column bonuses. Solid runs land at 30-40; tight play hits 50+.\n\nDraw with intent — every cell is borrowed real estate.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as cartographersNequeSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-cartographers-neque-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-cartographers-neque-skip"]', pulses: 3 };
  },
  component: cartographersNequeGame,
};
