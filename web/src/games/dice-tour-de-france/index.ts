import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTourDeFranceState, DiceTourDeFranceStateAction, DiceTourDeFranceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTourDeFranceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTourDeFrancePlugin: GamePlugin<DiceTourDeFranceState, DiceTourDeFranceStateAction, typeof settings> = {
  id: "dice-tour-de-france", title: "Dice Tour de France", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Stage racing; sprints, mountains, time trials.",
  howToPlay: "Dice Tour de France models the 21-stage Grand Tour of cycling, the sport's most prestigious race. The Tour combines flat sprint stages, lung-busting mountain climbs in the Alps and Pyrenees, and individual time trials, with the yellow jersey awarded to the lowest cumulative time. Each stage tells its own story while feeding into the GC battle.\n\nThis dice-only sim plays 21 stages. Each round (a stage), you Roll three dice. Outcomes: triple (stage win and bonus +3 your team), sum >= 14 (top-five finish +1 your team), sum <= 6 (lost time on the climb, opp +1), otherwise pack finish (no change).\n\nGame ends at 21 your points (stage wins is unrealistic, so this is a points classification) or 21 rounds. Final score formula: 80 + (3 × your points) - (2 × opponent points) + (2 × rounds remaining if you finish early). Average runs 110 to 160. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceTourDeFranceSettings),
  reducer, isTerminal, component: DiceTourDeFranceGame,
};
