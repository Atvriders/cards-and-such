import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gulbaraRacePlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "gulbara-race",
  title: "Gul Bara",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "All checkers move the same direction; doubles trigger replay privileges.",
  howToPlay: "Gul Bara, sometimes spelled Gulbara, is a Middle-Eastern backgammon variant where all pieces from both players move in the same direction around the board. There is no hitting — only blocking. Doubled rolls (a pair like 4-4) traditionally grant special replay privileges and several extra moves.\n\nThis single-player version simulates the race on a 24-point linear track with 15 checkers per side. Click Roll to throw two six-sided dice. Click any of your checkers, then pick a die value or the combined sum to advance it. Each die is used at most once per turn.\n\nThe display is a horizontal track of 25 cells, with cell 24 as the bear-off zone. Both you and the CPU race in the same direction (left to right) for purposes of progress display, but the CPU's checkers are tracked separately.\n\nKey Gul Bara tactics: build prime walls of two or more checkers to block the CPU; race your back-runners forward early. The CPU plays random legal moves, so steady advancement wins consistently. Bear off all fifteen pieces to win and earn a pip-differential bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
