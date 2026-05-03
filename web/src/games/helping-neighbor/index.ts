import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HelpingNeighborState, HelpingNeighborAction, HelpingNeighborSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HelpingNeighborGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HelpingNeighborGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const helpingNeighborPlugin: GamePlugin<HelpingNeighborState, HelpingNeighborAction, typeof settings> = {
  id:"helping-neighbor", title:"Helping Your Neighbor", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll-to-give dice. 12 rounds; each die face dictates points and giving.",
  howToPlay:"Help Your Neighbor (also called Going to the Dogs) is a circle dice game where roll-faces correspond to \"neighbors\" — and matching means losing chips. In this single-player adaptation across 12 rounds, you roll three dice and try to avoid the \"neighbor\" face (3) while collecting safe-face points.\n\nEach round you roll three dice. Faces 1, 2 = neutral (no effect). Face 3 = \"neighbor\" (each costs you 5 points, can go negative-flooring). Face 4, 5 = small reward (+5 each). Face 6 = jackpot (+15).\n\n12 rounds total. Average expected score: 50-150 points. The neighbor-3 face appears about half the rolls; balancing the risk against the 6-jackpots is what makes the game tense.\n\nThe \"real\" multiplayer version gives chips to literal neighbors at the table; here you're just dodging the neighbor face for solo points. Classic family dice in compact form.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HelpingNeighborSettings),
  reducer,isTerminal,
  hint: (state: HelpingNeighborState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-helping-neighbor-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-helping-neighbor-next"]', pulses: 3 };
    return null;
  },
  component:HelpingNeighborGame,
};
