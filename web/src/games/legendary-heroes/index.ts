import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LegendaryHeroesState, LegendaryHeroesAction, LegendaryHeroesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LegendaryHeroesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LegendaryHeroesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const legendaryHeroesPlugin: GamePlugin<LegendaryHeroesState, LegendaryHeroesAction, typeof settings> = {
  id:"legendary-heroes",
  title:"Legendary Heroes",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Recruit hero cards to defeat villains.",
  howToPlay:"Legendary Heroes is a 10-round combat card game inspired by the Marvel deckbuilder. Each round, you draw two Hero cards (worth 1-7) and the villain reveals one Threat card (worth 1-9). Your hero sum versus threat: if heroes win, score equals double the difference. If threat wins, you score zero this round. 🦸\n\nTies score 1. The expected hero sum is about 8, threats average 5, so you win roughly 70% of rounds. Total scores typically land between 30 and 60 across 10 rounds.\n\nPress Draw to summon heroes and reveal the villain's threat. Then Next to face the next encounter. Watch the hero icons glow blue, threats glow red. Score 50+ to write yourself into Legendary history. The compact tableau makes each fight quick and dramatic. Quick, decisive battles for a fantasy fix in less than a minute.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LegendaryHeroesSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-legendary-heroes-primary"]', pulses: 3 }),
  component:LegendaryHeroesGame,
};
