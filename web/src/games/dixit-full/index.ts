import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DixitFullState, DixitFullAction, DixitFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const DixitFullGameLazy = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then(m => ({ default: m.DixitFullGame as unknown as React.ComponentType<unknown> })),
);

const settings = {
  _dummy: { kind: "boolean", label: "(unused)", default: false } as const,
} as const;

export const dixitFullPlugin: GamePlugin<DixitFullState, DixitFullAction, typeof settings> = {
  id: "dixit-full",
  title: "Dixit",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Storyteller picks a card and gives an evocative clue; everyone else submits a matching card and votes — guess too easy or too hard and you score nothing.",
  howToPlay: `Dixit is a storytelling card game built around evocative dream-like artwork.

You play 1-vs-3-CPUs (Iris, Mox, Wren). Each player holds 6 cards from an 84-card deck of surreal images.

ROUND FLOW
Each round, one player is the storyteller. The storyteller secretly picks one of their cards and gives a clue — a word, phrase, or sentence that suggests the card's mood or content without being too obvious or too obscure.

When YOU are the storyteller: type your clue and click the card from your hand that the clue is about, then press "Tell the story".

When a CPU is the storyteller, it picks a card and a phrase automatically. Then the clue appears at the top of the play area.

Each non-storyteller (you included) chooses one card from their hand that they think matches the clue and submits it face-down. The submitted cards plus the storyteller's are shuffled and revealed face-up on the table.

Each non-storyteller then secretly votes for the card they think is the storyteller's. You cannot vote for your own card.

SCORING
- If ALL non-storytellers correctly identify the storyteller's card, the storyteller scores 0 and everyone else scores 2.
- If NONE correctly identifies it, the storyteller again scores 0 and everyone else scores 2.
- Otherwise, the storyteller and each correct guesser score 3 points.
- Additionally, each non-storyteller scores 1 extra point per vote their card received.

The trick is to give a clue that is just clear enough — too obvious and everyone guesses; too obscure and nobody does.

After scoring, each player draws back up to 6 cards and the storyteller seat rotates.

WIN CONDITION
The first player to reach 30 points wins. (Your final score on the leaderboard is your point total — but only if you won.)`,
  settings,
  initialState: (seed: number, s) => initialState(seed, s as DixitFullSettings),
  reducer,
  isTerminal,
  hint: (s) => {
    if (isTerminal(s as DixitFullState) != null) return null;
    const st = s as DixitFullState;
    if (st.phase === "story-pick" && st.storyteller === 0) {
      // Suggest the submit button (or the clue input if empty).
      if (st.clueDraft.trim().length === 0) return { selector: '[data-testid="dxf-clue-input"]', pulses: 3 };
      if (st.pendingStoryCard == null) return { selector: '[data-testid^="dxf-hand-"]', pulses: 3 };
      return { selector: '[data-testid="dxf-submit-story"]', pulses: 3 };
    }
    if (st.phase === "submit" && st.storyteller !== 0) {
      return { selector: '[data-testid^="dxf-submit-"]', pulses: 3 };
    }
    if (st.phase === "vote" && st.storyteller !== 0) {
      return { selector: '[data-testid^="dxf-vote-"]', pulses: 3 };
    }
    if (st.phase === "reveal") return { selector: '[data-testid="dxf-next-round"]', pulses: 3 };
    return null;
  },
  component: DixitFullGameLazy,
};
