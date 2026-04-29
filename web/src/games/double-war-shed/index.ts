import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleWarShedState, DoubleWarShedAction, DoubleWarShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleWarShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleWarShedPlugin: GamePlugin<DoubleWarShedState, DoubleWarShedAction, typeof settings> = {
  id: "double-war-shed", title: "Double War", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "War with two-card battles.",
  howToPlay: "Double War is a War variant where each turn both players reveal two cards, and the higher total wins both pairs. Ties trigger a War where three cards are placed face down and a fourth face up to break the tie.\n\nIn this single-player version you face the CPU across six rounds. Each round both players start with twenty-six cards. The simulation runs through a deck-empty resolution and reports who collected more cards by the time of exhaustion.\n\nWin a round by holding more cards at the end (or by capturing all). Each round won is worth twenty points plus a five-point card-margin bonus.\n\nDouble War is significantly faster than classic War because two cards play per turn. It is a popular schoolyard variant in the United States. The game is mostly luck but two-card totals smooth out the variance noticeably — long rounds happen but are less common than in plain War.\n\nA strong total across six rounds is around eighty. Press Play to start the next two-card battle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DoubleWarShedSettings),
  reducer, isTerminal, component: DoubleWarShedGame,
};
