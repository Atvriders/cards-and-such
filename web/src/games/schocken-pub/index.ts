import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SchockenPubState, SchockenPubAction, SchockenPubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SchockenPubGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const schockenPubPlugin: GamePlugin<SchockenPubState, SchockenPubAction, typeof settings> = {
  id: "schocken-pub",
  title: "Schocken Pub",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German three-dice pub bluff game. Predict ranking tier.",
  howToPlay: "Schocken is a beloved German pub dice game with three rolling dice and three ranking tiers. The single-player version asks you to predict where each three-dice roll lands: Schock (any combination including a 1, 1, X for X >= 2 — the elite tier), Straße (any straight, like 1-2-3 or 4-5-6), or Plain (everything else).\n\nSchock occurs on roughly 20 of 216 outcomes (9.3%) and pays 50. Straße occurs on roughly 36 of 216 (16.7%) and pays 25. Plain covers the rest (74%) and pays 6. Expected value per call: Schock 4.6, Straße 4.2, Plain 4.4 — almost identical, which gives the call genuine strategic weight.\n\nThe game runs 12 rounds. Real Schocken in pubs is a bluffing game with hidden cups; here the dice show openly and you predict in advance. Average score hovers near 65 points. Calling Schock when you feel lucky can spike scores above 120; the Plain call is the safe bet that almost always pays a little.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SchockenPubSettings),
  reducer,
  isTerminal,
  component: SchockenPubGame,
};
