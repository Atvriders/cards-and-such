import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnipSnapShedState, SnipSnapShedAction, SnipSnapShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnipSnapShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const snipSnapShedPlugin: GamePlugin<SnipSnapShedState, SnipSnapShedAction, typeof settings> = {
  id: "snip-snap-shed", title: "Snip Snap Snorem", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Early shedding matching game.",
  howToPlay: "Snip Snap Snorem is one of the oldest English shedding games, dating to the eighteenth century. Players in turn play matching ranks calling 'Snip', then 'Snap', then 'Snorem' for the third and fourth match. Whoever plays Snorem leads the next trick.\n\nIn this single-player version you face the CPU across six rounds. Each round you each start with seven cards. You take turns trying to match the leader's rank with one of your own. Matches are called Snip, Snap, and Snorem in sequence; whoever calls Snorem leads the next trick and the rest pass cards as penalty.\n\nWin the round by being first to empty your hand. Each round won is worth twenty points plus a five-point bonus per card still in the CPU's hand. The earliest reference to Snip Snap Snorem appears in 1719, making it older than most modern card games. Aim for around seventy points across six rounds. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SnipSnapShedSettings),
  reducer, isTerminal, component: SnipSnapShedGame,
};
