import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BadeuceyDrawState, BadeuceyDrawAction, BadeuceyDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BadeuceyDrawGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: BadeuceyDrawState): HintTarget | null => (state.phase === "see" ? { selector: ".dm-btn", pulses: 3 } : null);

export const badeuceyDrawPlugin: GamePlugin<BadeuceyDrawState, BadeuceyDrawAction, typeof settings> = {
  id: "badeucey-draw", title: "Badeucey Draw", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Combined Badugi and 2-7 Triple Draw lowball-poker hybrid.",
  howToPlay: "Badeucey is a combined poker variant: each round produces both a Badugi hand (four unique-suit/rank cards, lowest ranks best) and a 2-7 Lowball hand (lowest five cards, no pairs). The pot is split between the two outcomes. Badeucey is among the most demanding of mixed games.\n\nIn this single-player adaptation you play against the dealer over twelve rounds. Each round you and the dealer are dealt five cards. You may play (compare hands by sum-of-rank, aces high in this simplification) or fold. The comparison gives a generic hand-strength score.\n\nA win pays fourteen points (with a king-high bonus of three); a tie pays five; a fold or loss pays zero. Twelve rounds are played.\n\nExpected score across twelve rounds is sixty to ninety. Badeucey's split-pot flavour is approximated by the consistent comparison — every round contests fairly. Fold obvious trash, play average-or-better, and look for high-card dominance to net the king bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BadeuceyDrawSettings),
  reducer, isTerminal, hint, component: BadeuceyDrawGame,
};
