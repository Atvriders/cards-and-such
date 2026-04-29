import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSnookerMatchState, DiceSnookerMatchStateAction, DiceSnookerMatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSnookerMatchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSnookerMatchPlugin: GamePlugin<DiceSnookerMatchState, DiceSnookerMatchStateAction, typeof settings> = {
  id: "dice-snooker-match", title: "Dice Snooker Match Play", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "147 maximum break tracker; safety play mechanics.",
  howToPlay: "Dice Snooker Match Play models a snooker match with break tracking. In real snooker, a maximum break of 147 (potting 15 reds with 15 blacks then potting all colors) is the holy grail — a televised maximum is a career-defining feat. Match play features safety battles where players deliberately don't pot, instead leaving difficult shots for the opponent.\n\nThis dice-only sim runs frames over 15 rounds. Each round (a frame), you Roll three dice. Outcomes: triple (century break +20 — outstanding!), sum >= 14 (good frame +10), sum <= 6 (frame lost, opp +10), otherwise modest break (+4).\n\nGame ends at 70 your points or 15 rounds. Final score formula: 80 + (2 × your points) - (1 × opponent points) + (3 × rounds remaining if you finish early). Snooker's slower rhythm rewards consistency — a 5-frame run of breaks beats one century surrounded by losses. Average runs 130 to 180. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceSnookerMatchSettings),
  reducer, isTerminal, component: DiceSnookerMatchGame,
};
