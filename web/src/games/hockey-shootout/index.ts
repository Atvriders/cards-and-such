import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type HockeyShootoutState, type HockeyShootoutAction } from "./state.js";
const HockeyShootout = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HockeyShootout as unknown as React.ComponentType<unknown> })));
export const hockeyShootoutSettings = {
  shots: { kind: "enum" as const, label: "Shots", options: ["5", "10"] as const, default: "5" as const },
} as const;

export const hockeyShootoutPlugin: GamePlugin<HockeyShootoutState, HockeyShootoutAction, typeof hockeyShootoutSettings> = {
  id: "hockey-shootout",
  title: "Hockey Shootout",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One-on-one with the goalie. Use dekes and placement to beat the netminder.",
  howToPlay: `Hockey Shootout is a classic penalty-shot scenario — you skate in alone and must beat the goalie. Each attempt gives you three controls to outsmart the netminder.

Shot Left/Right positions where the puck crosses the goal line. The goalie marker shows the netminder's base position — always aim away from it. Height determines whether you go low (pad save territory) or up high to the corners (top shelf).

The Deke control is your secret weapon. Setting it far from your actual shot direction fakes the goalie and opens up space. For example, fake right (deke=0.8) then shoot far left (aim=0.1) to pull the goalie out of position. The more opposite your deke from your shot, the greater the advantage.

Danger zones: extreme posts (near 0 or 1 aim) have a chance of clanging iron. Too high risks clearing the crossbar. The five-hole (aim=center, height=low) is risky but possible if the goalie bites on the deke.

Scoring: goals divided by total shots, scaled to 1000. NHL shootout conversion rates hover around 33% — can you double that?`,
  settings: hockeyShootoutSettings,
  initialState,
  reducer,
  isTerminal,
    hint: (state: HockeyShootoutState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-hockey-shootout-action"]', pulses: 3 };
    },
  component: HockeyShootout,
};
