import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TavliGrState, TavliGrAction, TavliGrSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TavliGrGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tavliGreekRacePlugin: GamePlugin<TavliGrState, TavliGrAction, typeof settings> = {
  id: "tavli-greek-race",
  title: "Tavli (Greek) Race",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Greek Tavli race variant; first to bear off all 15 checkers wins.",
  howToPlay: "Tavli is the Greek family of three backgammon variants; here you play a simplified single-leg race against the CPU. In this lightweight single-player edition you race against a random CPU opponent. On your turn you roll two six-sided dice. You may move any checker forward by one die value, or by both dice combined. Click the matching button on a checker to commit the move. Once both dice are spent your turn ends and the CPU rolls. The board shows a horizontal track of 24 points; player tokens are red and CPU tokens are dark. Each side starts with 15 checkers at point zero. The first side to push every checker past the final point wins the match. Scoring rewards a win heavily: a victory grants 100 points plus a pip-count bonus equal to how far ahead of your opponent you finish. A loss scores 0. The CPU plays random legal moves, so a little planning gives you a real edge. Run your back checkers first, then bear off as fast as you can.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TavliGrSettings),
  reducer,
  isTerminal,
  component: TavliGrGame,
};
