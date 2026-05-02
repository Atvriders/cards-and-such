import type { TutorialStep } from "./Tutorial.js";

/**
 * Per-game tutorial step definitions. Selectors are chosen against rendered
 * DOM produced by each game's component. If a selector cannot be found at
 * runtime the step still renders centered on screen.
 */
export const TUTORIALS: Record<string, TutorialStep[]> = {
  klondike: [
    {
      title: "Goal",
      target: ".klondike .foundation-wrapper",
      text: "Build all four foundations from Ace to King by suit. Empty the tableau to win.",
    },
    {
      title: "Draw cards",
      target: ".klondike .stock-wrapper",
      text: "Click the stock to flip cards onto the waste. When stock is empty, click again to recycle.",
    },
    {
      title: "Play to tableau",
      target: ".klondike-tableau-row",
      text: "Drag cards between tableau piles in alternating colors and descending rank. Click a card to auto-move it if a legal target exists.",
    },
    {
      title: "Auto-move",
      target: ".klondike .auto-move-btn",
      text: "Send every card that fits to the foundations in one go. You can also press A.",
    },
  ],
  freecell: [
    {
      title: "Goal",
      target: ".freecell .foundation-wrapper",
      text: "Move every card to the four foundations, Ace through King by suit.",
    },
    {
      title: "Free cells",
      target: ".freecell .freecell-wrapper",
      text: "Each free cell holds one card temporarily. Use them to maneuver cards out of the cascades.",
    },
    {
      title: "Cascades",
      target: ".freecell-cascade-row",
      text: "Build cascades down by alternating colors. Click a card to send it to the best legal spot.",
    },
    {
      title: "Auto-move",
      target: ".freecell .auto-move-btn",
      text: "Promote every safe card to the foundations at once.",
    },
  ],
  spider: [
    {
      title: "Goal",
      target: ".spider .completed-wrapper",
      text: "Build eight in-suit runs from King to Ace. Completed suits move here.",
    },
    {
      title: "Deal a row",
      target: ".spider .stock-wrapper",
      text: "Click the stock to deal one card onto every tableau column. Every column must have at least one card first.",
    },
    {
      title: "Tableau",
      target: ".spider-tableau-row",
      text: "Stack cards in descending rank. Same-suit runs can be moved together.",
    },
  ],
  "holdem-no-limit": [
    {
      title: "Goal",
      target: ".holdem-pot",
      text: "Win chips by making the best 5-card hand or by getting your opponent to fold. Last player standing wins the pot.",
    },
    {
      title: "Your hand",
      target: ".holdem-seat-player .holdem-hole",
      text: "These are your hole cards. Combine them with the community cards in the middle.",
    },
    {
      title: "Actions",
      target: ".holdem-actions",
      text: "Fold, check, call, or raise. Hotkeys: F fold, C check, K call, R raise.",
    },
    {
      title: "Stacks",
      target: ".holdem-seat-player .holdem-stack",
      text: "Watch your stack — when you bust or beat the CPU stack the session ends.",
    },
  ],
  "mini-yahtzee": [
    {
      title: "Goal",
      target: ".yahtz-card",
      text: "Score the highest total across 13 rounds. Each category can only be used once.",
    },
    {
      title: "Roll",
      target: ".yahtz-controls",
      text: "You get up to three rolls per round. Click dice to keep them between rolls.",
    },
    {
      title: "Score a category",
      target: ".yahtz-card",
      text: "Click any unused row to bank that round's score there. Pick wisely — every category must eventually be filled.",
    },
    {
      title: "Bonus",
      target: ".yahtz-bonus-row",
      text: "Score 63+ points in the upper section to earn a 35-point bonus.",
    },
  ],
  "farkle-mini": [
    {
      title: "Goal",
      target: ".farkle-totals",
      text: "Bank as many points as you can over 10 rounds. Roll a Farkle and you lose the round.",
    },
    {
      title: "Roll dice",
      target: ".farkle-controls",
      text: "Roll all six dice to start. After each roll, set aside scoring dice.",
    },
    {
      title: "Pick scorers",
      target: ".farkle-dice",
      text: "Click dice to lock them in. Single 1s and 5s, three of a kind, runs, and triples all score.",
    },
    {
      title: "Bank or push",
      target: ".farkle-stat-bank",
      text: "Bank to keep your round points, or keep rolling for more — but a Farkle wipes the round bank.",
    },
  ],
  "wordle-mini": [
    {
      title: "Goal",
      target: ".wm-board",
      text: "Guess the 5-letter target word in six tries.",
    },
    {
      title: "Tile colors",
      target: ".wm-row",
      text: "Green = correct letter, correct spot. Yellow = correct letter, wrong spot. Gray = not in the word.",
    },
    {
      title: "Type a guess",
      target: ".wm-keyboard",
      text: "Use the on-screen keyboard or your physical keyboard. Press Enter to submit.",
    },
  ],
  "monopoly-mini": [
    {
      title: "Goal",
      target: ".monopolymini-hud-top",
      text: "End the game with more cash than the CPU. You play through a fixed number of turns.",
    },
    {
      title: "Roll & move",
      target: ".monopolymini-board",
      text: "Roll the dice to move around the board. Land on properties to buy them, or pay rent if owned.",
    },
    {
      title: "Cash watch",
      target: ".monopolymini-stat-you",
      text: "Track your cash here. Going broke ends the game early.",
    },
  ],
};

export function tutorialFor(gameId: string): TutorialStep[] | undefined {
  return TUTORIALS[gameId];
}

const STORAGE_KEY = "cards-tutorial-seen";

interface SeenMap {
  [gameId: string]: boolean;
}

function readSeen(): SeenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as SeenMap) : {};
  } catch {
    return {};
  }
}

export function hasSeenTutorial(gameId: string): boolean {
  return !!readSeen()[gameId];
}

export function markTutorialSeen(gameId: string): void {
  try {
    const map = readSeen();
    map[gameId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / disabled storage */
  }
}

/**
 * The first-run welcome carousel uses a reserved key inside the same
 * `cards-tutorial-seen` SeenMap so all tutorial-seen flags live together.
 * The reserved key (double-underscore prefix) cannot collide with a real
 * game id, which are slug strings.
 */
const WELCOME_KEY = "__welcome__";

export function hasSeenWelcomeTutorial(): boolean {
  return !!readSeen()[WELCOME_KEY];
}

export function markWelcomeTutorialSeen(): void {
  try {
    const map = readSeen();
    map[WELCOME_KEY] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function resetWelcomeTutorial(): void {
  try {
    const map = readSeen();
    delete map[WELCOME_KEY];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / disabled storage */
  }
}

/* ----------------------------------------------------------------------
 * Onboarding coachmark — a one-shot floating tooltip pointing at the
 * Featured strip on the lobby. Set to "pending" when the welcome
 * carousel is dismissed (or when the user manually re-arms it from
 * Settings → Gameplay), flipped to "done" the first time the user
 * dismisses it (tile click, navigation, Esc, or the X). The "done"
 * state is sticky so the coachmark never re-shows on its own.
 *
 * Stored under its own key so the import/export round-trip can include
 * it without disturbing the SeenMap.
 * -------------------------------------------------------------------- */
export const COACHMARK_KEY = "cards-onboard-coachmark";
export type CoachmarkState = "pending" | "done" | "unset";

export function getCoachmarkState(): CoachmarkState {
  try {
    if (typeof localStorage === "undefined") return "unset";
    const raw = localStorage.getItem(COACHMARK_KEY);
    if (raw === "pending" || raw === "done") return raw;
    return "unset";
  } catch {
    return "unset";
  }
}

export function setCoachmarkPending(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(COACHMARK_KEY, "pending");
  } catch {
    /* ignore */
  }
}

export function setCoachmarkDone(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(COACHMARK_KEY, "done");
  } catch {
    /* ignore */
  }
}
