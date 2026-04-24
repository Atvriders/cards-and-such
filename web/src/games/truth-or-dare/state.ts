import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TODSettings {
  rounds: "10" | "20" | "30";
  mode: "family" | "party";
}

const TRUTHS_FAMILY: string[] = [
  "What is the most embarrassing thing that's ever happened to you?",
  "What is your biggest pet peeve?",
  "If you could be any animal, what would you be and why?",
  "What is a secret talent you have?",
  "What was your most embarrassing school moment?",
  "What's the silliest thing you're afraid of?",
  "Have you ever walked into a glass door?",
  "What is the weirdest dream you've ever had?",
  "What would you do if you were invisible for a day?",
  "What is the longest you've gone without showering?",
  "What is one thing you wish you could change about yourself?",
  "What's the strangest thing you've ever eaten?",
  "If you had to eat one food for the rest of your life, what would it be?",
  "What is something you've done that you've never told your parents?",
  "What's the most childish thing you still do?",
  "Have you ever blamed someone else for something you did?",
  "What's the most times you've watched the same movie?",
  "If you could swap lives with someone in this room, who would it be?",
  "What is your most used emoji?",
  "Have you ever been caught talking to yourself?",
];

const DARES_FAMILY: string[] = [
  "Do your best impression of someone in the group.",
  "Talk in an accent for the next 3 turns.",
  "Do 10 jumping jacks right now.",
  "Speak only in rhymes for the next minute.",
  "Make up a short rap about the person to your left.",
  "Do your best robot dance for 30 seconds.",
  "Say the alphabet backwards as fast as you can.",
  "Let someone tickle you for 10 seconds.",
  "Do your funniest walk around the room.",
  "Balance a book on your head for 30 seconds.",
  "Make the ugliest face you can and hold it for 10 seconds.",
  "Speak in slow motion for the next two turns.",
  "Pretend to be a cat for the next 2 minutes.",
  "Do your best celebrity impression.",
  "Let the group write something on your face with a washable marker.",
  "Hop on one foot for 30 seconds.",
  "Sing the chorus of your favourite song right now.",
  "Do a cartwheel or attempt one.",
  "Describe yourself using only animal sounds.",
  "Air guitar solo for 20 seconds.",
];

const TRUTHS_PARTY: string[] = [
  ...TRUTHS_FAMILY,
  "What's the worst date you've ever been on?",
  "Have you ever ghosted someone and felt bad about it?",
  "What's the most embarrassing thing in your phone's search history?",
  "Have you ever had a crush on a friend's partner?",
  "What's the biggest lie you've told in the past year?",
];

const DARES_PARTY: string[] = [
  ...DARES_FAMILY,
  "Text your most recent contact a random emoji with no explanation.",
  "Let someone in the group post something on your social media.",
  "Tell your most embarrassing story.",
  "Do your best impression of the person who dared you.",
  "Call someone and sing them Happy Birthday regardless of the date.",
];

export interface TODCard {
  kind: "truth" | "dare";
  text: string;
}

export interface TODState {
  settings: TODSettings;
  cards: TODCard[];
  currentIndex: number;
  completed: number;
  phase: "pick" | "show" | "done";
}

export type TODAction =
  | { type: "pick"; choice: "truth" | "dare" }
  | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: TODSettings): TODState {
  const rng = mulberry32(seed);
  const truths = settings.mode === "party" ? TRUTHS_PARTY : TRUTHS_FAMILY;
  const dares = settings.mode === "party" ? DARES_PARTY : DARES_FAMILY;
  const count = parseInt(settings.rounds, 10);

  const shuffledTruths = shuffle(truths, rng);
  const shuffledDares = shuffle(dares, rng);

  // Pre-generate alternating card sequence (truth/dare decided by rng at game time, not pre-assigned)
  // We store a pool of both and let player choose
  void shuffledTruths;
  void shuffledDares;

  // Generate a sequence of cards: alternating for variety
  const cards: TODCard[] = [];
  let ti = 0;
  let di = 0;
  for (let i = 0; i < count; i++) {
    if (rng() > 0.5 && ti < shuffledTruths.length) {
      cards.push({ kind: "truth", text: shuffledTruths[ti++]! });
    } else if (di < shuffledDares.length) {
      cards.push({ kind: "dare", text: shuffledDares[di++]! });
    } else if (ti < shuffledTruths.length) {
      cards.push({ kind: "truth", text: shuffledTruths[ti++]! });
    }
  }

  return { settings, cards, currentIndex: 0, completed: 0, phase: "pick" };
}

export function reducer(state: TODState, action: TODAction): TODState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "pick": {
      if (state.phase !== "pick") return state;
      // Replace current card's kind with player's choice
      const card = state.cards[state.currentIndex];
      if (!card) return state;
      const updated = [...state.cards];
      updated[state.currentIndex] = { ...card, kind: action.choice };
      return { ...state, cards: updated, phase: "show" };
    }
    case "next": {
      if (state.phase !== "show") return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.cards.length) {
        return { ...state, completed: state.completed + 1, phase: "done" };
      }
      return { ...state, currentIndex: nextIndex, completed: state.completed + 1, phase: "pick" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: TODState): { score: number } | null {
  if (state.phase === "done") return { score: state.completed };
  return null;
}
