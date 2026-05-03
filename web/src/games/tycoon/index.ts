import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TycoonState, TycoonAction, TycoonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TycoonGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tycoonPlugin: GamePlugin<TycoonState, TycoonAction, typeof settings> = {
  id: "tycoon", title: "Tycoon", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese Daifugo variant — climbing shedding with social hierarchy.",
  howToPlay: "Tycoon (Daifugo or Daihinmin) is a popular Japanese climbing shedding game where players race to empty their hands. After each round players are ranked Tycoon (winner), Vice-Tycoon, ordinary, Vice-Beggar, and Beggar (loser). At the start of the next round the loser must give their two highest cards to the winner, who returns two low cards — a brutal feedback loop. Plays are singles, pairs, triples, or quads, each beating the previous play. Special card '8 cuts' (eight stops the round and lets you restart). In this CPU duel across six rounds with the swap rule active, click Play Round. Strategy: as Tycoon you keep dominating; as Beggar you must take risks with bombs (four-of-a-kind which clears the pile). Playing 8 stops the climb chain. Aim for at least two Tycoon finishes and a total above one hundred.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TycoonSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-tycoon-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-tycoon-next"]', pulses: 3 };
    return null;
  }, component: TycoonGame,
};
