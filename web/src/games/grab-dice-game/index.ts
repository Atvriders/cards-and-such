import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrabDiceGameState, GrabDiceGameAction, GrabDiceGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GrabDiceGameGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GrabDiceGameGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const grabDiceGamePlugin: GamePlugin<GrabDiceGameState, GrabDiceGameAction, typeof settings> = {
  id: "grab-dice-game",
  title: "Grab Dice Game",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick reflex dice game — predict the sum tier.",
  howToPlay: "Grab is the simple grab-the-dice contest popular at parties — players race to scoop the right combination after a roll. This variant rewards prediction. Across 13 rounds four dice are rolled. Predict: Grab Hand (sum 14 or more) pays +25, Skim (sum 10-13) pays +15, Drop (sum 4-9) pays +20. The four-dice modal sum is 14, so Grab Hand and Skim split the upper half of outcomes; Drop covers the lower long tail. Wrong call scores zero. Strategy: the central 10-13 band holds about 38% of rolls — Skim is steady but capped near +75 across thirteen rounds; mixing Grab Hand picks can push +180 with a few high rolls. Drop only triggers when most dice show 1 or 2 simultaneously — about 25% odds. Thirteen rounds, top score wins. The original party version had no probabilities; players just scrambled. This adaptation honours the 'who can read the roll faster' instinct.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrabDiceGameSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-grab-dice-game-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-grab-dice-game-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-grab-dice-game-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-grab-dice-game-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-grab-dice-game-next"]', pulses: 3 };
  },
  component: GrabDiceGameGame,
};
