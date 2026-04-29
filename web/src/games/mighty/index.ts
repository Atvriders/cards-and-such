import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MightyState, MightyAction, MightySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MightyGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const mightyPlugin: GamePlugin<MightyState, MightyAction, typeof settings> = {
  id: "mighty", title: "Mighty", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Korean 54-card bidding game with a Mighty (3♠) trump card.",
  howToPlay: "Mighty is the Korean national five-player bidding trick-taking game played with a fifty-four-card deck (a normal pack plus two jokers). The Mighty card itself is the three of spades — it always wins any trick regardless of suit or trump, the only exception being the joker leading. Players bid for a contract (target tricks plus trump suit) and the high bidder picks a partner via a friend card call. In this simplified one-on-one CPU duel across six rounds, you face a CPU partnership; click Play Round to bid and play. Strategy: bid aggressively when holding the Mighty (3♠) since it guarantees one trick. Save high trumps for late rounds where opponents have shown out. The joker can lead and force out the Mighty. Aim for at least three made contracts.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MightySettings),
  reducer, isTerminal, component: MightyGame,
};
