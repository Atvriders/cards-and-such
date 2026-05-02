import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CalabresellaState, CalabresellaAction, CalabresellaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CalabresellaGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const calabresellaPlugin: GamePlugin<CalabresellaState, CalabresellaAction, typeof settings> = {
  id: "calabresella",
  title: "Calabresella",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Calabresella — Calabrian 3-player trick.",
  howToPlay: "Calabresella — Calabrian 3-player trick. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as CalabresellaSettings),
  reducer,
  isTerminal,
  component: CalabresellaGame,
};
