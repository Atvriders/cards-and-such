import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersCitiesState, SevenWondersCitiesAction, SevenWondersCitiesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersCitiesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersCitiesPlugin: GamePlugin<SevenWondersCitiesState, SevenWondersCitiesAction, typeof settings> = {
  id: "seven-wonders-cities",
  title: "7 Wonders: Cities",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spy and diplomat themed draft with diplomacy.",
  howToPlay: "7 Wonders: Cities is a homage to Antoine Bauza's Cities expansion, adding spies, diplomats, and debt to the drafting structure. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau across four suits. Three of one suit earn +10 (a city guild); five earn an additional +15 (the city wonder stage). Pairs of rank earn +5 (diplomat tokens); three-of-a-kind +10 (spy network). Raw ranks sum as commerce. Score equals tableau total plus a +25 bonus for beating the CPU. Strategy: this expansion rewards mixed strategies — debt-style aggression by stealing high-rank cards from the CPU's preferred suit can prevent their guild bonus. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersCitiesSettings),
  reducer,
  isTerminal,
  component: SevenWondersCitiesGame,
};
