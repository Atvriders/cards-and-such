import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleDummyWhistState, DoubleDummyWhistAction, DoubleDummyWhistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleDummyWhistGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const doubleDummyWhistPlugin: GamePlugin<DoubleDummyWhistState, DoubleDummyWhistAction, typeof settings> = {
  id: "double-dummy-whist",
  title: "Double Dummy Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Double Dummy Whist — fixed hands, perfect info.",
  howToPlay: "Double Dummy Whist — fixed hands, perfect info. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as DoubleDummyWhistSettings),
  reducer,
  isTerminal,
  component: DoubleDummyWhistGame,
};
