import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WenzState, WenzAction, WenzSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WenzGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wenzPlugin: GamePlugin<WenzState, WenzAction, typeof settings> = {
  id: "wenz",
  title: "Wenz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wenz — Schafkopf variant, only Jacks are trumps.",
  howToPlay: "Wenz — Schafkopf variant, only Jacks are trumps. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as WenzSettings),
  reducer,
  isTerminal,
  component: WenzGame,
};
