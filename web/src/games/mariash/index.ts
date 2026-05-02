import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MariashState, MariashAction, MariashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MariashGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mariashPlugin: GamePlugin<MariashState, MariashAction, typeof settings> = {
  id: "mariash",
  title: "Mariáš",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mariáš — Czech trick game with melds.",
  howToPlay: "Mariáš — Czech trick game with melds. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as MariashSettings),
  reducer,
  isTerminal,
  component: MariashGame,
};
