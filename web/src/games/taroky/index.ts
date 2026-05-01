import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TarokyState, TarokyAction, TarokySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TarokyGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tarkyPlugin: GamePlugin<TarokyState, TarokyAction, typeof settings> = {
  id: "taroky",
  title: "Taroky",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Czech Taroky — bidding tarot.",
  howToPlay: "Czech Taroky — bidding tarot. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as TarokySettings),
  reducer,
  isTerminal,
  component: TarokyGame,
};
