import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuartetMatchState, QuartetMatchAction, QuartetMatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuartetMatchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuartetMatchGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const quartetMatchPlugin: GamePlugin<QuartetMatchState, QuartetMatchAction, typeof settings> = {
  id:"quartet-match", title:"Quartet Match", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Find four cards of the same rank in a 7-card hand. Higher ranks score more.",
  howToPlay:`Quartet Match deals you a hand of seven random cards each round. Your job: pick exactly four cards that all share the same rank to form a quartet. Tap cards to select and deselect them — when four are highlighted, press Submit.

If your four cards form a quartet, you score points equal to the rank's value times ten: a quartet of twos earns 20 points, a quartet of tens earns 100, a quartet of Aces earns a maximum 140 points. Mixed ranks earn nothing for that round, so make sure you find a true quartet before submitting.

Most rounds the deal won't actually contain a quartet at all — that's part of the puzzle. Examine your hand carefully and only submit when you're sure. The pass option for a round is to submit a hand you know won't score; play five (or ten) rounds and aim for the highest total. Quick eyes beat slow ones — let's go!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as QuartetMatchSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-quartet-match-primary"]', pulses: 3 }),component:QuartetMatchGame,
};
