import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HotTakeSettings {
  rounds: "10" | "20" | "30";
}

const TAKES: string[] = [
  "Pineapple belongs on pizza.",
  "Die Hard is a Christmas movie.",
  "Cats are better pets than dogs.",
  "Working from home is more productive than going to an office.",
  "Breakfast food is the best food at any time of day.",
  "A hot dog is a sandwich.",
  "The book is almost never better than the movie.",
  "Socks with sandals is actually fine.",
  "People who don't like spicy food are cowards.",
  "GIF is pronounced 'JIF'.",
  "Raisins in cookies should be illegal.",
  "Cereal before milk is objectively wrong.",
  "The Oxford comma is unnecessary.",
  "Standing desks are overrated.",
  "Summer is worse than winter.",
  "Emojis have made communication better.",
  "Silence is better background music than any playlist.",
  "Folding laundry is a waste of time.",
  "Reply-all emails should be banned.",
  "Napping in the middle of the day is a sign of good lifestyle choices.",
  "Reality TV is legitimate entertainment.",
  "The selfie stick was a great invention.",
  "Air conditioning is used too aggressively.",
  "Sleep is more important than exercise.",
  "Board games are more fun than video games.",
  "Subtitles should always be on.",
  "Streaming killed the movie theater experience.",
  "Butter makes everything better.",
  "Escalators should have a walking lane and a standing lane at all times.",
  "Open-plan offices are a productivity disaster.",
  "Social media has done more harm than good.",
  "Public speaking is more terrifying than death.",
  "Running is the most boring form of exercise.",
  "Money can buy happiness.",
  "Tap water is fine.",
];

export interface HotTakeState {
  settings: HotTakeSettings;
  takes: string[];
  currentIndex: number;
  agreeCount: number;
  disagreeCount: number;
  phase: "playing" | "done";
}

export type HotTakeAction =
  | { type: "agree" }
  | { type: "disagree" }
  | { type: "skip" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: HotTakeSettings): HotTakeState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const takes = shuffle(TAKES, rng).slice(0, Math.min(count, TAKES.length));
  return { settings, takes, currentIndex: 0, agreeCount: 0, disagreeCount: 0, phase: "playing" };
}

export function reducer(state: HotTakeState, action: HotTakeAction): HotTakeState {
  if (state.phase === "done") return state;
  const nextIndex = state.currentIndex + 1;
  const done = nextIndex >= state.takes.length;

  switch (action.type) {
    case "agree":
      return { ...state, agreeCount: state.agreeCount + 1, currentIndex: nextIndex, phase: done ? "done" : "playing" };
    case "disagree":
      return { ...state, disagreeCount: state.disagreeCount + 1, currentIndex: nextIndex, phase: done ? "done" : "playing" };
    case "skip":
      return { ...state, currentIndex: nextIndex, phase: done ? "done" : "playing" };
    default:
      return state;
  }
}

export function isTerminal(state: HotTakeState): { score: number } | null {
  if (state.phase === "done") return { score: state.agreeCount };
  return null;
}
