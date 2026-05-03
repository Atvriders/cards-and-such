import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxZombieState, FluxxZombieAction, FluxxZombieSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FluxxZombieGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FluxxZombieGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxZombiePlugin: GamePlugin<FluxxZombieState, FluxxZombieAction, typeof settings> = {
  id: "fluxx-zombie", title: "Zombie Fluxx", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Zombie Fluxx variant trivia. Identify which apocalypse card belongs in the deck.",
  howToPlay: "Zombie Fluxx tests your knowledge of Looney Labs' undead Fluxx variant from 2007. Each of twelve rounds names a card and asks its type — Keeper, Goal, Action, New Rule, or Creeper. Ten points per correct, 120 max. The signature change in Zombie Fluxx is the abundance of Creepers (zombies) like Schoolyard Zombies, Backyard Zombies, Office Zombies — they spread and stick to your tableau, blocking standard win conditions. To compensate, Goals come in 'Survivors' flavours that count surviving Keepers like Gun, Chainsaw, and Twinkies. The famous Twinkies Keeper is a love letter to Zombieland. Frequent Fluxx players who like the horror aesthetic hit 100+; newer players should still clear 60. Run takes about two minutes. Submit and Next on each card. Zombie Fluxx is the variant that introduced 'Ungoals' (everyone loses if condition met) — a brilliant twist that intensifies the chaos of late-game play.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxZombieSettings),
  reducer, isTerminal, hint: (state: FluxxZombieState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fluxx-zombie-answer-0"]', pulses: 3 } : null, component: FluxxZombieGame,
};
