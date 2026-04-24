import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HotSeatSettings {
  questions: "10" | "15" | "20";
}

const QUESTIONS: string[] = [
  "What is your biggest regret?",
  "If you could only keep three possessions, what would they be?",
  "What is the most embarrassing song on your playlist?",
  "What skill do you wish you had learned as a child?",
  "If you had to describe yourself in three words, what would they be?",
  "What is the strangest compliment you've ever received?",
  "What would you do if you won $1 million tomorrow?",
  "Who in this room do you think would last longest in the wilderness?",
  "What is something you're surprisingly bad at?",
  "What habit are you secretly proud of?",
  "If your life were a movie, what genre would it be?",
  "What is the best meal you've ever eaten?",
  "What did you want to be when you grew up?",
  "What is the weirdest job you've ever had or would consider?",
  "If you could live in any era of history, when would you choose?",
  "What is a hill you would die on?",
  "What fictional character do you relate to most?",
  "What would your warning label say?",
  "What is the most useless talent you have?",
  "If you could only watch one TV show forever, what would it be?",
  "What is something you lied about as a kid?",
  "What's your most irrational fear?",
  "What's the first thing you'd do if you were invisible for a day?",
  "If you could instantly master one instrument, which would you pick?",
  "What's a conspiracy theory you secretly half-believe?",
  "What's the most spontaneous thing you've ever done?",
  "If you could swap jobs for a month, what would you do?",
  "What's a social norm you think is completely unnecessary?",
  "What's the nicest thing a stranger has ever done for you?",
  "If you could un-invent one thing, what would it be?",
  "What would you title your autobiography?",
  "What's one question you wish people would ask you more often?",
  "What's the biggest risk you've ever taken?",
  "What's your most controversial food opinion?",
  "What's the kindest thing you've ever done that no one knows about?",
];

export interface HotSeatState {
  settings: HotSeatSettings;
  questions: string[];
  currentIndex: number;
  phase: "playing" | "done";
}

export type HotSeatAction = { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: HotSeatSettings): HotSeatState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const questions = shuffle(QUESTIONS, rng).slice(0, Math.min(count, QUESTIONS.length));
  return { settings, questions, currentIndex: 0, phase: "playing" };
}

export function reducer(state: HotSeatState, action: HotSeatAction): HotSeatState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex };
    }
    default:
      return state;
  }
}

export function isTerminal(state: HotSeatState): { score: number } | null {
  if (state.phase === "done") return { score: state.questions.length };
  return null;
}
