import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KnockOutWhistState, KnockOutWhistAction, KnockOutWhistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KnockOutWhistGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const knockOutWhistPlugin: GamePlugin<KnockOutWhistState, KnockOutWhistAction, typeof settings> = {
  id: "knock-out-whist",
  title: "Knock Out Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Knock Out Whist — fewer cards each round.",
  howToPlay: "Knock Out Whist — fewer cards each round. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as KnockOutWhistSettings),
  reducer,
  isTerminal,
  component: KnockOutWhistGame,
};
