import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DonutStackArcState, DonutStackArcAction, DonutStackArcSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DonutStackArcGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const donutStackArcPlugin: GamePlugin<DonutStackArcState, DonutStackArcAction, typeof settings> = {
  id: "donut-stack-arc", title: "Donut Stack", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Stack donuts on a pole at just the right power — too high or too low and they fall off!",
  howToPlay: `Donut Stack Arcade challenges your power control. Each round set the slider and toss a donut at a vertical pole. The closer your power to the hidden target, the more perfectly it lands and the higher your score. 10 rounds of glazed challenge — can you build the perfect donut tower?`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DonutStackArcSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-donut-stack-arc-action"]', pulses: 3 }; },
  component: DonutStackArcGame,
};
