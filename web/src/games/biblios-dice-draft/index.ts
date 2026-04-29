import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BibliosDiceDraftState, BibliosDiceDraftAction, BibliosDiceDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BibliosDiceDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bibliosDiceDraftPlugin: GamePlugin<BibliosDiceDraftState, BibliosDiceDraftAction, typeof settings> = {
  id: "biblios-dice-draft",
  title: "Biblios Dice",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dice-drafting Biblios variant homage.",
  howToPlay: "Biblios Dice is a homage to Steve Finn's dice-drafting variant of Biblios, where dice replace cards as drafted resources distributed among monks. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau across the four suits (here representing dice colors). Three of one suit earn +10 (a monastery bonus); five earn an additional +15 (an illuminated tome). Pairs of rank earn +5 (a paired die); three-of-a-kind +10 (a tripled die set). Raw ranks sum as resource. Score equals tableau total plus +25 for beating the CPU. Strategy: dice-drafting rewards taking high-rank values aggressively. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BibliosDiceDraftSettings),
  reducer,
  isTerminal,
  component: BibliosDiceDraftGame,
};
