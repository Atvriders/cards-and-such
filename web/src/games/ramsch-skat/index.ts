import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RamschSkatState, RamschSkatAction, RamschSkatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RamschSkatGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ramschSkatPlugin: GamePlugin<RamschSkatState, RamschSkatAction, typeof settings> = {
  id: "ramsch-skat",
  title: "Ramsch (Skat)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ramsch — avoid points variant.",
  howToPlay: "Ramsch — avoid points variant. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as RamschSkatSettings),
  reducer,
  isTerminal,
  component: RamschSkatGame,
};
