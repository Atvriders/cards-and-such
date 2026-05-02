import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HoneymoonBridgeState, HoneymoonBridgeAction, HoneymoonBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HoneymoonBridgeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const honeymoonBridgePlugin: GamePlugin<HoneymoonBridgeState, HoneymoonBridgeAction, typeof settings> = {
  id: "honeymoon-bridge",
  title: "Honeymoon Bridge",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Honeymoon Bridge — 2-player draw-and-play.",
  howToPlay: "Honeymoon Bridge — 2-player draw-and-play. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as HoneymoonBridgeSettings),
  reducer,
  isTerminal,
  component: HoneymoonBridgeGame,
};
