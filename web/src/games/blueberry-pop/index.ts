import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlueberryPopState, BlueberryPopAction, BlueberryPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlueberryPopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const blueberryPopPlugin: GamePlugin<BlueberryPopState, BlueberryPopAction, typeof settings> = {
  id: "blueberry-pop", title: "Blueberry Pop", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Pop blueberries into the bowl with perfect power — too strong or too weak and you miss!",
  howToPlay: `Blueberry Pop is about precise power control. Each round a blueberry is ready to be popped into a bowl. Set your power slider and press Go! — the closer your power to the hidden target, the more points you score. Chain perfect pops for a massive score over 10 rounds!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as BlueberryPopSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-blueberry-pop-action"]', pulses: 3 }; },
  component: BlueberryPopGame,
};
