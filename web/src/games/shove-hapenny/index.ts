import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShoveHapennyState, ShoveHapennyAction, ShoveHapennySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShoveHapennyGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const shoveHapennyPlugin: GamePlugin<ShoveHapennyState, ShoveHapennyAction, typeof settings> = {
  id: "shove-hapenny",
  title: "Shove Ha'penny",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push coins into bed lines. Traditional English pub game.",
  howToPlay: "Shove Ha'penny is the classic English coin-pushing pub game. The board has nine horizontal beds, and you must land a coin in each bed three times. In this digital take, each turn you press Shove and a precision-roll determines where your coin lands: a perfect shove (5% chance) lands a bullseye worth 20 points, a near-miss (15% chance) earns 14, a moderate shove (30% chance) earns 8, a weak shove (30% chance) earns 4, and a total miss (20% chance) earns 0. Across ten turns the average lifetime score is 60-90; great runs land 130+. The trick is pure luck, there's no aiming control, just the satisfying roll-and-reveal of an old-pub coin slide. After the throw resolves, press Next to advance. Score equals total points across ten throws. A high score requires multiple bullseyes back-to-back, which is statistically rare but does happen. Settle in for a slow rhythm, like bar-day card-game pacing.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShoveHapennySettings),
  reducer,
  isTerminal,
  component: ShoveHapennyGame,
};
