import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceTourDeFranceState, DiceTourDeFranceAction, DiceTourDeFranceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceTourDeFranceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceTourDeFranceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceTourDeFrancePlugin: GamePlugin<DiceTourDeFranceState, DiceTourDeFranceAction, typeof settings> = {
  id: "dice-tour-de-france",
  title: "Dice Tour de France",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Tour de France: race 36 squares against 3 CPUs; first across the line wins.',
  howToPlay: 'Dice Tour de France is a real, dice-driven simulation. Dice Tour de France: race 36 squares against 3 CPUs; first across the line wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceTourDeFranceSettings),
  reducer,
  isTerminal,
  hint: (state: DiceTourDeFranceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-tour-de-france-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-tour-de-france-next"]', pulses: 3 };
    return null;
  },
  component: DiceTourDeFranceGame,
};
