import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sorrySlidersPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "sorry-sliders",
  title: "Sorry! Sliders",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sorry variant with slide zones that boost pieces forward several cells at once.",
  howToPlay: "Sorry! Sliders is a Sorry-family race game that adds slippery slide zones around the track. Landing on the start of a slide carries your pawn several cells forward at once. This simplified single-player edition models the race with two dice and a 44-cell track.\n\nYou play one color against a random CPU. Click Roll to throw the dice, then click any of your four pawns to advance it by either die or by the combined sum. The slides are abstracted into the regular pip totals.\n\nThe display shows a horizontal track of 45 cells; the last cell is your home base. Bring all four pawns to home to win.\n\nSliders rewards keeping a steady advance: spreading your pawns out means more chances to land on slide-bonus rolls. The CPU plays random legal moves, so consistent play beats it reliably. Final score is 100 plus your pip-count lead at game end. A solid Sliders win earns +25 or better in pip-differential bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
