import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RubberBridgeState, RubberBridgeAction, RubberBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RubberBridgeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const rub-bPlugin: GamePlugin<RubberBridgeState, RubberBridgeAction, typeof settings> = {
  id: "rubber-bridge",
  title: "Rubber Bridge",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rubber Bridge — heads-up trick play.",
  howToPlay: "Rubber Bridge — heads-up trick play. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as RubberBridgeSettings),
  reducer,
  isTerminal,
  component: RubberBridgeGame,
};
