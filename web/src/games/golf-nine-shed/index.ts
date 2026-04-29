import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GolfNineShedState, GolfNineShedAction, GolfNineShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GolfNineShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golfNineShedPlugin: GamePlugin<GolfNineShedState, GolfNineShedAction, typeof settings> = {
  id: "golf-nine-shed", title: "Golf (Nine-Card)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Golf variant with a 3x3 grid.",
  howToPlay: "Nine-Card Golf is the deluxe version of card-game golf, played on a 3x3 grid of face-down cards. Players peek at three cards, then take turns drawing and swapping to lower their total. Pairs in any column score zero.\n\nIn this single-player version you play six holes against the CPU. Each hole both players have a 3x3 grid and a fixed number of swap turns. Cards revealed at the end are summed; pairs in a column cancel to zero, three-of-a-kind in a column counts as a 'birdie' bonus of negative ten.\n\nLow cards are pip values, jacks are zero, queens and kings are ten, and aces are one. The lower total wins twenty points plus a margin bonus. Across six holes a strong score is around eighty points.\n\nNine-Card Golf rewards patience — swapping into a column you might pair takes nerve. The game pace is slower than four-card but the strategy depth is much higher. Press Play to tee up the next hole.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GolfNineShedSettings),
  reducer, isTerminal, component: GolfNineShedGame,
};
