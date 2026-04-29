import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlaverjassenState, KlaverjassenAction, KlaverjassenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KlaverjassenGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const klaverjassenPlugin: GamePlugin<KlaverjassenState, KlaverjassenAction, typeof settings> = {
  id: "klaverjassen", title: "Klaverjassen", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dutch national trick-taking game with melds and trump.",
  howToPlay: "Klaverjassen is the Dutch national card game, a partnership trick-taking game played with a thirty-two card deck. Each round eight cards are dealt to each player, trumps are declared, and tricks are played following must-follow and must-overtrump rules. Bonus points are scored for melds (three or four card runs in one suit), the king-queen pair of trump (stuk), and capturing the last trick. In this one-on-one duel you face a CPU partnership across six trump rounds, click Play Round to play out the hand. Strategy: pull trump quickly when holding the jack of trump (the highest card), but conserve aces in side suits for guaranteed tricks. Try to declare meld points by collecting consecutive cards in the same suit. Aim for at least three made contracts and a total score above four hundred for a respectable finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KlaverjassenSettings),
  reducer, isTerminal, component: KlaverjassenGame,
};
