import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PinochleState, PinochleAction, PinochleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PinochleGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pinochlePlugin: GamePlugin<PinochleState, PinochleAction, typeof settings> = {
  id: "pinochle",
  title: "Pinochle",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pinochle — 48-card double deck. A,10,K,Q,J,9 ranking.",
  howToPlay: "Pinochle — 48-card double deck. A,10,K,Q,J,9 ranking. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as PinochleSettings),
  reducer,
  isTerminal,
  component: PinochleGame,
};
