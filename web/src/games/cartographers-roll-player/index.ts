import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { cartographersRollPlayerState, cartographersRollPlayerAction, cartographersRollPlayerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { cartographersRollPlayerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographersRollPlayerPlugin: GamePlugin<cartographersRollPlayerState, cartographersRollPlayerAction, typeof settings> = {
  id: "cartographers-roll-player",
  title: "Cartographers: Roll Player Tale",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cartographers crossover with Roll Player universe — fantasy monsters appear on the map.",
  howToPlay: "Cartographers: A Roll Player Tale is a roll-and-write where you draw on a 4x4 kingdom map while fantasy monsters from the Roll Player universe periodically appear. Each turn flips a season card; you receive a die value 1-6 and decide which map cell to mark.\n\nPress Roll to draw a card. Click any unmarked cell to fill it with the die value, scoring 2 points per cell. The game runs twelve turns. Monsters in this distillation don't tear up your sheet — they're a thematic flavor — but the cell-by-cell tension remains.\n\nCompleting a row or column earns +5 bonus, and filling all sixteen cells triggers a Kingdom Mapped bonus of +10. Skipping a roll passes the turn cost-free but burns one of your twelve.\n\nThis adaptation captures the spirit of the Roll Player crossover — you're a cartographer charting a fantasy realm — without the full polyomino terrain rules. A solid run scores 35-45; perfect mapping pushes 55+.\n\nMap carefully; the monsters love a sloppy edge.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as cartographersRollPlayerSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-cartographers-roll-player-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-cartographers-roll-player-skip"]', pulses: 3 };
  },
  component: cartographersRollPlayerGame,
};
