import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCurlingStonesState, DiceCurlingStonesStateAction, DiceCurlingStonesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCurlingStonesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCurlingStonesPlugin: GamePlugin<DiceCurlingStonesState, DiceCurlingStonesStateAction, typeof settings> = {
  id: "dice-curling-stones", title: "Dice Curling Stones", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Eight stones per end; sweep decision and last stone bonus.",
  howToPlay: "Dice Curling Stones models a competitive curling match. Each end (round), both teams alternate eight stones into the house — the concentric scoring rings at the far end of the ice. Only the team with stones closer to the button (center) than any opponent stone scores, with one point per qualifying stone. Strategy revolves around guards, takeouts, and the all-important last stone (hammer) advantage.\n\nThis dice-only sim plays 10 ends. Each round, you Roll three dice. Outcomes: triple (steal of three +3 — rare and dramatic!), sum >= 14 (point ends with 2 your team), sum <= 6 (opponent takes 2, opp +2), otherwise blanked end (no change).\n\nGame ends at 8 your points or 10 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Curling rewards patience and reading the ice. Average runs 110 to 150. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceCurlingStonesSettings),
  reducer, isTerminal, component: DiceCurlingStonesGame,
};
