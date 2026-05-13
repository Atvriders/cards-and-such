import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingOfTokyoFullState, KingOfTokyoFullAction, KingOfTokyoFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const KingOfTokyoFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.KingOfTokyoFullGame as unknown as React.ComponentType<unknown> }))
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "(reserved)", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const kingOfTokyoFullPlugin: GamePlugin<KingOfTokyoFullState, KingOfTokyoFullAction, typeof settings> = {
  id: "king-of-tokyo-full",
  title: "King of Tokyo (Full)",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yahtzee-style monster brawl: roll dice, claim Tokyo, smash opponents to victory.",
  howToPlay:
    "King of Tokyo is a Yahtzee-style monster brawl. You play one of four monsters (Gigazaur, The King, Cyber Bunny, or Meka Dragon) — three CPU monsters take the others. Additional monster art ideas: Alienoid, Kraken.\n\n" +
    "Each monster starts with 10 HP and 0 Victory Points (VP). On your turn you roll six dice up to three times — keep dice between rolls. The six faces are: 1, 2, 3, Claw, Heart, and Energy.\n\n" +
    "Resolve dice:\n" +
    "- Three matching numbers score that number in VP (three 1s = 1 VP, three 2s = 2 VP, three 3s = 3 VP). Each extra matching die past three is +1 VP.\n" +
    "- Each Claw deals 1 damage. If you are IN Tokyo, every Claw hits ALL opponents. If you are NOT in Tokyo, every Claw hits the monster in Tokyo.\n" +
    "- Each Heart heals 1 HP, but you cannot heal while in Tokyo.\n" +
    "- Each Energy gives you 1 energy token.\n\n" +
    "Tokyo: If Tokyo is empty and you attacked, you must enter Tokyo and gain 1 VP. At the start of your turn while in Tokyo, gain 2 VP. The monster in Tokyo cannot heal, but can hit everyone. When hit, the monster in Tokyo may yield Tokyo to the attacker.\n\n" +
    "Power cards (spend energy): Plot Twist (2E), Healing Ray (3E heal 2), Detritivore (4E claws +1), Energy Hoarder (3E), Extra Head (5E hearts +1). Five cards are implemented; advanced rules (full card market, dice flipping, exact 3+ of a kind sub-effects) are omitted.\n\n" +
    "Win by reaching 20 VP or by being the last monster standing.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingOfTokyoFullSettings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.players[state.current]?.isCpu) {
      return { selector: '[data-testid="hint-target-king-of-tokyo-full-primary"]', pulses: 3 };
    }
    if (state.phase === "rolling") {
      if (state.rollsUsed < 3) {
        return { selector: '[data-testid="hint-target-king-of-tokyo-full-primary"]', pulses: 3 };
      }
      return { selector: '[data-testid="kot-end-rolling"]', pulses: 3 };
    }
    if (state.phase === "buyPhase") {
      return { selector: '[data-testid="kot-skip-buy"]', pulses: 3 };
    }
    if (state.phase === "yieldPrompt") {
      return { selector: '[data-testid="kot-yield-no"]', pulses: 3 };
    }
    return null;
  },
  component: KingOfTokyoFullGame,
};
