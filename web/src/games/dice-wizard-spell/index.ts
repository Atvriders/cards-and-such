import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceWizardSpellState, DiceWizardSpellAction, DiceWizardSpellSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceWizardSpellGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceWizardSpellGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceWizardSpellPlugin: GamePlugin<DiceWizardSpellState, DiceWizardSpellAction, typeof settings> = {
  id:"dice-wizard-spell", title:"Dice Wizard Spell", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cast spells; product of dice = mana.",
  howToPlay:"Dice Wizard Spell is a 10-round dice-rolling game where score is the product of two six-sided dice. 🧙 Each round, press Roll Dice and two dice tumble across the screen. Multiply the pips: that's your round score.\n\nProducts range from 1 (snake eyes) to 36 (double sixes), with the median product around 12. Across 10 rounds the expected score is around 120, but lucky double-six rounds can push you well past 200. There's no strategy — it's pure luck — but each high product feels like a magical critical roll.\n\nPress Next after each result to continue, or Finish on the final round. Watch your running score climb in the upper right. Great for quick mini-game breaks: the whole game is over in well under a minute. Roll well, and may the dice multiply in your favor.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceWizardSpellSettings),
  reducer,
  isTerminal,
  hint: (state: DiceWizardSpellState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "channel") return { selector: '[data-testid="hint-target-dice-wizard-spell-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-wizard-spell-next"]', pulses: 3 };
    return null;
  },
  component:DiceWizardSpellGame,
};
