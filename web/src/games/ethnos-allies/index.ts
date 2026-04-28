import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EthnosAlliesState, EthnosAlliesAction, EthnosAlliesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EthnosAlliesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ethnosAlliesPlugin: GamePlugin<EthnosAlliesState, EthnosAlliesAction, typeof settings> = {
  id: "ethnos-allies",
  title: "Ethnos Allies",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft monster allies. Control regions, trigger sudden scoring.",
  howToPlay: "Ethnos Allies is a card-drafting region-control game inspired by Ethnos. You draft cards representing four ally types: sun-warriors, moon-mystics, star-merchants, leaf-rangers. Each round, three offers appear; you pick one, the CPU takes the highest-rank remaining. Eight rounds total. Score by combining suit and rank patterns: three same-type allies earn +10 bonus, five earn another +15, pairs of same rank earn +5, triples earn +10. Raw rank sums also count. Final score equals tableau total plus +25 bonus if you beat the CPU. Strategy: in Ethnos, suit focus controls regions; here it controls bonuses. Lock a suit lead by taking the same type twice in early rounds even if rank-low. Then take high-rank cards in mid-late game. Aim for 70-110 with bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EthnosAlliesSettings),
  reducer,
  isTerminal,
  component: EthnosAlliesGame,
};
