import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DuelAgoraSenateState, DuelAgoraSenateAction, DuelAgoraSenateSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DuelAgoraSenateGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const duelAgoraSenatePlugin: GamePlugin<DuelAgoraSenateState, DuelAgoraSenateAction, typeof settings> = {
  id: "duel-agora-senate",
  title: "7 Wonders Duel: Agora",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-drafting: pick one of 3 each round, build combos.",
  howToPlay: "7 Wonders Duel: Agora is a card-drafting game over 8 rounds. Each round, 3 cards are revealed; pick one and the CPU greedily takes the highest-rank remaining. Cards belong to 4 suits: Senator, Vote, Decree, Censor. Score by combining suits and ranks: 3 of the same suit earns +10, 5 of the same suit earns another +20; pairs of the same rank earn +5, three-of-a-kind earns +12. Raw rank values sum into your tableau total. Final score equals your tableau plus a +25 bonus if you beat the CPU. Strategy: focus 1-2 suits to lock multiple suit bonuses; the CPU greedily grabs high-rank cards, so undervalued same-suit picks slip through.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DuelAgoraSenateSettings),
  reducer,
  isTerminal,
  component: DuelAgoraSenateGame,
};
