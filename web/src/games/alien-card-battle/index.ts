import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AlienCardBattleState, AlienCardBattleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AlienCardBattle = /* @__PURE__ */ lazy(() => import("./AlienCardBattle.js").then((mod) => ({ default: mod.AlienCardBattle as unknown as React.ComponentType<unknown> })));
export const alienCardBattleSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type AlienCardBattleSettingsType = SettingsOf<typeof alienCardBattleSettings>;

export const alienCardBattlePlugin: GamePlugin<AlienCardBattleState, AlienCardBattleAction, typeof alienCardBattleSettings> = {
  id: "alien-card-battle",
  title: "Alien Card Battle",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Battle an alien opponent round by round — use alien abilities to dominate the card clash.",
  howToPlay: `Alien Card Battle is a head-to-head card game set in deep space. You and an opponent each hold a hand of alien warrior cards and play one per round. The card with the higher effective strength wins the round. Win the most rounds to claim victory.

Each alien card belongs to one of four species: Zorg, Nexu, Vrix, or Plaz. Cards have a base strength value plus one of four abilities. Double multiplies the card's strength by two before comparison. Steal takes 40% of the opponent card's strength and adds it to yours. Block caps the stronger card's value to match yours if you would lose. None plays the card straight.

Abilities resolve simultaneously and interact: a Steal against a Block results in both effects applying in order. Choosing the right ability against a predicted opponent card is the key skill.

Your opponent plays randomly from their hand each round. Watching which cards they've played helps predict what remains. If they lead strong cards early, their later plays may be weaker.

Choose how many rounds to play (5, 7, or 10). Your score is the percentage of rounds you won — win 6 of 7 rounds to score 86, for example. Tie rounds count for neither side.

Strategy: save Double for low-strength cards to surprise; use Steal against high-strength opponents; use Block as a defensive card when you suspect a massive hit.`,
  settings: alienCardBattleSettings,
  initialState: (seed: number, settings: AlienCardBattleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: AlienCardBattleState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-alien-card-battle-primary"]', pulses: 3 };
  },
  component: AlienCardBattle,
};
