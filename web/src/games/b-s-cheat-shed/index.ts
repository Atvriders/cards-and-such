import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BSCheatShedState, BSCheatShedAction, BSCheatShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BSCheatShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bSCheatShedPlugin: GamePlugin<BSCheatShedState, BSCheatShedAction, typeof settings> = {
  id: "b-s-cheat-shed", title: "B.S. (Cheat)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lie-about-your-play shedding game.",
  howToPlay: "B.S., also called Cheat, I Doubt It, or Bullshit, is a classic bluffing shedding game. Players in turn announce a rank and place that many cards face down. Other players may challenge the claim; if the challenger is right the bluffer takes the pile, otherwise the challenger does.\n\nIn this single-player version you face the CPU across six rounds. Each round you both start with thirteen cards. The deck cycles through ranks 2, 3, 4, etc. and you must place at least one card claiming that rank. You may bluff by placing wrong cards; the CPU may challenge you, and you may challenge the CPU.\n\nA bluff caught means you take the pile. A truthful play challenged sends the pile to the challenger. First to empty their hand wins the round for twenty points plus five per card the CPU still holds. Six rounds total. A strong score is around eighty; bluffing too often guarantees losses. Press Play and lie convincingly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BSCheatShedSettings),
  reducer, isTerminal, component: BSCheatShedGame,
};
