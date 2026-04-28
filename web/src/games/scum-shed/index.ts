import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScumShedState, ScumShedAction, ScumShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScumShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const scumShedPlugin: GamePlugin<ScumShedState, ScumShedAction, typeof settings> = {
  id: "scum-shed", title: "Scum", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "American President variant — play strictly higher to win the round.",
  howToPlay: "Scum is the American school-cafeteria sibling of President and Daifugo. The rules are simple: each player gets seven cards. Play begins with one player leading any card, and the other must play a strictly higher card or pass. When both players pass in succession, the trick clears and whoever played last takes the lead.\n\nThe first player to empty their hand earns the prized President title. The loser becomes the Scum and earns nothing. Six rounds are played, with the round winner scoring twenty-five points each time and the loser nothing. There are no rank-swap penalties in this two-player short version.\n\nStrategy boils down to deciding when to spend big cards and when to pass, hoping the opponent burns out a high lead. Average expected score across all six rounds is around seventy-five points; great nights pile up over a hundred. Beware of holding kings too long — the CPU will gladly out-pass you while you sit on aces.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScumShedSettings),
  reducer, isTerminal, component: ScumShedGame,
};
