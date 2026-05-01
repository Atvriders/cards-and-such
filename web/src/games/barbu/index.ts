import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BarbuState, BarbuAction, BarbuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarbuGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const barbPlugin: GamePlugin<BarbuState, BarbuAction, typeof settings> = {
  id: "barbu",
  title: "Barbu",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Barbu — French trick-taking with multiple deals.",
  howToPlay: "Barbu — French trick-taking with multiple deals. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BarbuSettings),
  reducer,
  isTerminal,
  component: BarbuGame,
};
