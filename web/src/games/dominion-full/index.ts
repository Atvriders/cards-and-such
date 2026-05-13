import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  DominionFullState,
  DominionFullAction,
  DominionFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const DominionFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.DominionFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  cpuCount: {
    kind: "enum" as const,
    label: "CPU opponents",
    options: ["1", "2"] as const,
    default: "1" as const,
  },
} as const;

type S = SettingsOf<typeof settings>;

export const dominionFullPlugin: GamePlugin<DominionFullState, DominionFullAction, typeof settings> = {
  id: "dominion-full",
  title: "Dominion (Full Base Set)",
  category: "cards",
  players: { min: 2, max: 3, multiplayer: true },
  description: "The classic deck-builder: buy cards, gain victory points, plunder kingdoms.",
  howToPlay:
    "Dominion is a deck-building card game. You start with a 10-card deck (7 Coppers + 3 Estates) and draw a hand of 5 each turn. Beat one or two CPU opponents in the race to the most victory points.\n\nEach turn has three phases:\n- ACTION: play action cards from your hand (you have 1 action by default; some cards grant +Actions)\n- BUY: play your treasures, then buy 1 card up to your coin total (some cards grant +Buys)\n- CLEANUP: discard your played cards and remaining hand, draw 5 fresh\n\nSupply piles:\n- Treasures: Copper (0c), Silver (3c, +2c), Gold (6c, +3c)\n- Victory: Estate (2c, 1VP), Duchy (5c, 3VP), Province (8c, 6VP)\n- Curse (0c, -1VP)\n- Kingdom cards (8): Cellar (+1 Action), Moat (+2 cards), Village (+1 card +2 actions), Workshop (gain a card up to 4c), Smithy (+3 cards), Festival (+2 actions +1 buy +2 coin), Laboratory (+2 cards +1 action), Market (+1 card +1 action +1 buy +1 coin)\n\nThe game ends when the Province pile is empty OR three supply piles are empty. Final score = total VP across your entire deck.\n\nThe CPU plays the famous \"Big Money\" strategy — skip most actions, rush Provinces and Golds. Beat it by building a real engine.\n\nADVANCED RULES OMITTED in this build: Chapel (trashing), Bureaucrat / Witch / Adventurer (attack & deck manipulation), Moat reaction to attacks (no attack cards present), discard-then-redraw for Cellar (simplified to +1 Action only).",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, {
    cpuCount: (s.cpuCount === "2" ? 2 : 1),
  } as DominionFullSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (isTerminal(state)) return null;
    const current = state.players[state.current];
    if (!current || current.isCpu) return null;
    if (state.workshopPending) return { selector: '.dfull-workshop button', pulses: 3 };
    if (state.phase === "action") {
      // Suggest playing an action card if any in hand, else end action phase
      const hasAction = current.hand.some(id => {
        // Hardcoded action ids — matches state.ts definitions
        return ["cellar", "moat", "village", "workshop", "smithy", "festival", "laboratory", "market"].includes(id);
      });
      if (hasAction && current.actions > 0) {
        return { selector: '.dfull-card.action:not(.disabled)', pulses: 3 };
      }
      return { selector: '[data-testid="hint-target-dominion-full-treasure"]', pulses: 3 };
    }
    if (state.phase === "buy") {
      // Suggest playing treasures or buying
      const hasTreasure = current.hand.some(id => ["copper", "silver", "gold"].includes(id));
      if (hasTreasure) return { selector: '[data-testid="hint-target-dominion-full-treasure"]', pulses: 3 };
      if (current.buys > 0 && current.coin >= 3) {
        return { selector: '.dfull-supply-card.buyable', pulses: 3 };
      }
      return { selector: '[data-testid="hint-target-dominion-full-endturn"]', pulses: 3 };
    }
    return null;
  },
  component: DominionFullGame,
};
