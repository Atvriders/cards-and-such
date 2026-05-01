import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TavliPortState, TavliPortAction, TavliPortSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TavliPortGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tavliPortesRacePlugin: GamePlugin<TavliPortState, TavliPortAction, typeof settings> = {
  id: "tavli-portes-race",
  title: "Tavli Portes (Greek)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "First of the three Greek Tavli variants — same rules as standard backgammon, race your checkers home.",
  howToPlay: "Tavli Portes is the first of three Greek backgammon variants traditionally played in succession in cafés across Greece. It is essentially the same as standard backgammon. Race your fifteen checkers around a 24-point track and bear them off before your opponent can.\n\nIn this simplified single-player version you play the white side against a random CPU. Click Roll to throw two six-sided dice. You may then advance any one of your fifteen checkers by either die value, or by both dice combined for a single piece. Each die may be used only once per turn.\n\nThe board appears as a horizontal track of 25 cells (cell 24 is the bear-off zone). White checkers race left to right; black checkers race right to left. Once all your checkers reach the bear-off zone the game ends and you win.\n\nYour final score is based on the pip-count differential at game end. Aim to keep checkers connected, advance the rear runners first, and bear off as quickly as possible. A high score in Portes is +30 or better.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TavliPortSettings),
  reducer,
  isTerminal,
  component: TavliPortGame,
};
