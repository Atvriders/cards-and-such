import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GladiatorArenaState, GladiatorArenaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GladiatorArena = /* @__PURE__ */ lazy(() => import("./GladiatorArena.js").then((mod) => ({ default: mod.GladiatorArena as unknown as React.ComponentType<unknown> })));
export const gladiatorArenaSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal",
  },
} as const;

type GladiatorArenaSettingsType = SettingsOf<typeof gladiatorArenaSettings>;

export const gladiatorArenaPlugin: GamePlugin<GladiatorArenaState, GladiatorArenaAction, typeof gladiatorArenaSettings> = {
  id: "gladiator-arena",
  title: "Gladiator Arena",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fight through waves of Roman gladiators — strike, power strike, or defend each round.",
  howToPlay: `Gladiator Arena is a turn-based combat arcade game set in ancient Rome. You are a gladiator fighting increasingly powerful opponents in the arena. Each round, you and your opponent exchange one blow.

On each turn you pick one of three actions. Strike: a reliable moderate hit using your base attack minus the opponent's defense, plus a small random bonus. Power Strike: a heavy blow dealing roughly double damage, but slower and easier to read. Defend: raises your defense by 4 for the round, reducing the opponent's counter-attack.

After you act, your opponent immediately counter-attacks. The damage they deal is their attack minus your current defense (modified by Defend), plus a random element. The round log records each exchange.

Defeating an opponent advances you to the next round, which brings a tougher gladiator with more HP and attack. You recover 10 HP between rounds and your attack grows by 1 per victory.

The game ends when your HP drops to 0. Score is based on how many rounds you survived: each victory beyond the first earns 20 points up to 100.

Strategy tip: use Defend when your HP is low or when facing a high-attack opponent. Power Strike is best for finishing a nearly-dead enemy before they can land more hits.`,
  settings: gladiatorArenaSettings,
  initialState: (seed: number, settings: GladiatorArenaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-gladiator-arena-action"]', pulses: 3 }; },
  component: GladiatorArena,
};
