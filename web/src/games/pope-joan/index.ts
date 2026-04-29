import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const popeJoanPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "pope-joan",
  title: "Pope Joan",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Round game with eight of diamonds as Pope Joan.",
  howToPlay: "Pope Joan is a traditional British round game where the 9 of diamonds (named 'Pope Joan') is the special card paying the fattest pot. Across ten rounds press Deal; a random deal happens and you may collect into pots: ace-pot, king-pot, queen-pot, jack-pot, marriage-pot, intrigue-pot, or the Pope Joan pot. Each round's random outcome pays one or more of these pots: Pope Joan (15% chance, 12 pts), marriage (King-Queen of trumps, 10% chance, 8 pts), intrigue (Queen-Jack of trumps, 10% chance, 6 pts), regular play (rest, 1-3 pts). The CPU plays simultaneously each round. Total points after ten rounds wins. Pope Joan was a parlor favorite in Victorian England, with a special wooden Pope Joan board sold to upper-middle-class households. The game was named after a legendary female pope; the 9 of diamonds was chosen for unclear reasons but persists. Press Deal to advance; the round result is revealed. Final scoreboard awards 100 points for the win, 25 for a tie.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
