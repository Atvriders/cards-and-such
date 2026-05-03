import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuarriorsDiceDeckbuildState, QuarriorsDiceDeckbuildAction, QuarriorsDiceDeckbuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuarriorsDiceDeckbuildGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuarriorsDiceDeckbuildGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const quarriorsDiceDeckbuildPlugin: GamePlugin<QuarriorsDiceDeckbuildState, QuarriorsDiceDeckbuildAction, typeof settings> = {
  id:"quarriors-dice-deckbuild",
  title:"Quarriors Dice Deckbuild",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to summon creatures.",
  howToPlay:"Quarriors Dice Deckbuild is a 10-round dice-rolling fantasy game inspired by the famous dice deckbuilder. Each round, you roll four six-sided dice. Each die represents a creature summoned (1=Apprentice, 2=Assistant, 3=Warrior, 4=Champion, 5=Quartzite, 6=Mage). Sum all four for your round score. 🐉\n\nQuiddity bonus: if you roll any pair of matching dice, +3. Two pairs gives +6. The expected average per round lands near 14. Across 10 rounds expect totals from 130 to 180.\n\nPress Roll to summon four creatures and tally, then Next to continue. Each die shows its rolled face. Score 160+ to be a Quarriors master. The game captures the rolling-and-summoning rhythm of the original in a brisk run that finishes in less than a minute. Pure, satisfying dice fantasy with a touch of quiddity bonus excitement.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as QuarriorsDiceDeckbuildSettings),
  reducer,
  isTerminal,
  hint: (state: QuarriorsDiceDeckbuildState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-quarriors-dice-deckbuild-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-quarriors-dice-deckbuild-next"]', pulses: 3 };
    return null;
  },
  component:QuarriorsDiceDeckbuildGame,
};
