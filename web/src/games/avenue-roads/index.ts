import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { avenueRoadsState, avenueRoadsAction, avenueRoadsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { avenueRoadsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const avenueRoadsPlugin: GamePlugin<avenueRoadsState, avenueRoadsAction, typeof settings> = {
  id: "avenue-roads",
  title: "Avenue",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shared card-flip road-drawing — connect coloured castles for bonus points.",
  howToPlay: "Avenue is a shared card-flip road-drawing game distilled into a 4x4 castle-map grid. Each turn you draw a road segment by rolling a 1-6 value and inscribing it into any open cell.\n\nPress Roll to reveal the next road card; click any unmarked cell to add the road there, scoring 2 points. Twelve roads total can be laid; the grid holds sixteen cells, so full coverage is impossible — choose wisely.\n\nCompleting any row counts as a Royal Road bonus (+5), any column as a Castle Connection bonus (+5), and the rare full-grid map (all sixteen cells) earns the +10 Cartographer bonus.\n\nSkipping passes the turn at no cost, but burns one of your twelve precious flips. A measured run scores 30-40; aggressive grid-completers hit 50+.\n\nThe original Avenue is a 6-player flip-and-draw race connecting coloured castles; this distillation preserves the core tension of choosing where each freshly-revealed road belongs without the multi-coloured castle network — every road still matters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as avenueRoadsSettings),
  reducer,
  isTerminal,
  component: avenueRoadsGame,
};
