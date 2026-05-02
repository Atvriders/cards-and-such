import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniBridgeState, MiniBridgeAction, MiniBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniBridgeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const minibridgePlugin: GamePlugin<MiniBridgeState, MiniBridgeAction, typeof settings> = {
  id: "minibridge",
  title: "Mini Bridge",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Bridge — 13 tricks, no trump.",
  howToPlay: "Mini Bridge — 13 tricks, no trump. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as MiniBridgeSettings),
  reducer,
  isTerminal,
  component: MiniBridgeGame,
};
