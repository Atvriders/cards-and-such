import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleDeckPinochleState, DoubleDeckPinochleAction, DoubleDeckPinochleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleDeckPinochleGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const dd-pinPlugin: GamePlugin<DoubleDeckPinochleState, DoubleDeckPinochleAction, typeof settings> = {
  id: "double-deck-pinochle",
  title: "Double-Deck Pinochle",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Double-Deck Pinochle — 80-card deck.",
  howToPlay: "Double-Deck Pinochle — 80-card deck. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as DoubleDeckPinochleSettings),
  reducer,
  isTerminal,
  component: DoubleDeckPinochleGame,
};
