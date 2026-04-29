import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const camelUpRacePlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "camel-up-race",
  title: "Camel Up",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet-and-race camel game; advance five pieces.",
  howToPlay: "Camel Up is the chaotic camel-stacking race; this minimal version is a five-piece linear race against the CPU. In this lightweight single-player edition you race against a random CPU opponent. On your turn you roll two six-sided dice. You may move any checker forward by one die value, or by both dice combined. Click the matching button on a checker to commit the move. Once both dice are spent your turn ends and the CPU rolls. The board shows a horizontal track of 16 points; player tokens are red and CPU tokens are dark. Each side starts with 5 checkers at point zero. The first side to push every checker past the final point wins the match. Scoring rewards a win heavily: a victory grants 100 points plus a pip-count bonus equal to how far ahead of your opponent you finish. A loss scores 0. The CPU plays random legal moves, so a little planning gives you a real edge. Run your back checkers first, then bear off as fast as you can.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
