import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { TrekAmericasState, TrekAmericasAction, TrekAmericasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrekAmericasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trekAmericasPlugin: GamePlugin<TrekAmericasState, TrekAmericasAction, typeof settings> = {
  id: "trek-americas",
  title: "Trek 12: Americas",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "North/South America expedition variant of Trek 12.",
  howToPlay: "Trek 12: Americas is an expedition variant of Trek 12 set in North and South America. In this adaptation you trek across a 4x4 expedition map by rolling a single d6 each turn and assigning the value to a map cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't help your route. Each marked cell scores its dice value as expedition progress. Strategy: complete rows and columns to claim continental crossings (+5 each), plus +10 for fully traversing the map. Trek 12's classic theme involves choosing operations on dice (add, subtract, multiply); here we simplify to direct value assignment. Higher rolls advance you faster; lower rolls help close partial lines. After 12 rolls the expedition ends. A solid Americas score is 34-48 points; an exceptional explorer reaches 65+. Seeded dice mean fresh trekking every game.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrekAmericasSettings),
  reducer,
  isTerminal, hint: (state: TrekAmericasState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-trek-americas-primary"]', pulses: 3 } : null),
  component: TrekAmericasGame,
};
