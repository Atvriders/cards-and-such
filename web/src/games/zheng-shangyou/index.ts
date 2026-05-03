import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ZhengState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZhengGame } from "./Game.js";

export const zhengSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type ZhengAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export const zhengPlugin: GamePlugin<ZhengState, ZhengAction, typeof zhengSettings> = {
  id: "zheng-shangyou",
  title: "Zheng Shangyou",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese climbing game — Fight to ascend! Play singles, pairs, sequences, or bomb quads to be first out.",
  howToPlay: `Zheng Shangyou (Fighting to Go Up) is a Chinese climbing card game for 4 players. You play against three bots.

Setup: all 52 cards are dealt evenly (13 per player). You lead the first play.

Card ranking: 3 is lowest, 4-5-6-7-8-9-10-J-Q-K, then Ace, then 2 (highest).

Legal combinations:
• Single — any one card
• Pair — two cards of the same rank
• Triple — three cards of the same rank
• Sequence — 5 or more consecutive cards (no 2s allowed)
• Pair Sequence — 3 or more consecutive pairs
• Quad (Bomb) — four cards of the same rank; beats any non-bomb

Gameplay: play a combination of the same type and same count but with a higher top card than the current pile, or pass. Once all other players pass, the last player who played leads a new round with any combination.

Bombs: a quad (four of a kind) can be played on any combination of any type, making it the ultimate power play.

Winning: first to shed all cards scores 100. 2nd = 60, 3rd = 30, last = 0.`,
  settings: zhengSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-zheng-shangyou-play"]', pulses: 3 };
      return null;
    },
  component: ZhengGame,
};
