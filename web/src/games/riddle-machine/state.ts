import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Riddle {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "classic" | "math" | "wordplay" | "lateral";
}

export interface RiddleSettings {
  dummy?: string;
}

export interface RiddleState {
  settings: RiddleSettings;
  rngSeed: number;
  queue: number[]; // shuffled riddle indices
  currentIndex: number;
  selectedOption: number | null;
  submitted: boolean;
  correct: boolean;
  totalScore: number;
  roundScore: number;
  streak: number;
  answered: number;
}

export type RiddleAction =
  | { type: "selectOption"; option: number }
  | { type: "submit" }
  | { type: "next" };

export const RIDDLES: Riddle[] = [
  {
    id: "doors",
    question: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?",
    options: ["A dream", "A map", "A painting", "A cloud"],
    correctIndex: 1,
    explanation: "A map has cities, mountains, and water drawn on it — but none of the real things.",
    category: "classic",
  },
  {
    id: "lighter",
    question: "The more you take, the more you leave behind. What am I?",
    options: ["Memories", "Footsteps", "Breaths", "Shadows"],
    correctIndex: 1,
    explanation: "Footsteps: the more steps you take, the more footprints you leave behind.",
    category: "classic",
  },
  {
    id: "alphabet",
    question: "What has to be broken before you can use it?",
    options: ["A promise", "An egg", "A record", "A seal"],
    correctIndex: 1,
    explanation: "An egg must be broken before you can cook and eat it.",
    category: "classic",
  },
  {
    id: "echo",
    question: "Speak softly and I answer. Shout and I answer louder. What am I?",
    options: ["A mirror", "A shadow", "An echo", "A crowd"],
    correctIndex: 2,
    explanation: "An echo repeats sound — louder shouting produces a louder echo.",
    category: "classic",
  },
  {
    id: "silence",
    question: "What can you catch but never throw?",
    options: ["A cold", "A wave", "A ball", "A lie"],
    correctIndex: 0,
    explanation: "You can catch a cold (get sick), but you can't throw a cold.",
    category: "wordplay",
  },
  {
    id: "halfword",
    question: "What 5-letter word becomes shorter when you add 2 letters to it?",
    options: ["Small", "Short", "Brief", "Tiny"],
    correctIndex: 1,
    explanation: "Adding 'er' to 'short' makes 'shorter' — the word about being shorter literally becomes 'shorter'.",
    category: "wordplay",
  },
  {
    id: "library",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    options: ["A book", "An echo", "A flag", "A dream"],
    correctIndex: 2,
    explanation: "A flag moves and 'speaks' visually when the wind blows, but has no mouth or ears.",
    category: "classic",
  },
  {
    id: "math1",
    question: "A rooster lays an egg on top of a barn. Which way does it roll?",
    options: ["North", "South", "Roosters don't lay eggs", "It depends on the wind"],
    correctIndex: 2,
    explanation: "Roosters are male chickens. They don't lay eggs. No egg rolls anywhere!",
    category: "lateral",
  },
  {
    id: "math2",
    question: "How many months have 28 days?",
    options: ["1", "2", "12", "4"],
    correctIndex: 2,
    explanation: "ALL 12 months have at least 28 days. The trick is that the question doesn't say 'exactly 28 days.'",
    category: "lateral",
  },
  {
    id: "math3",
    question: "A doctor gives you 3 pills and tells you to take one every half hour. How many minutes until you run out of pills?",
    options: ["90 minutes", "60 minutes", "45 minutes", "30 minutes"],
    correctIndex: 1,
    explanation: "Take pill 1 now (0 min), pill 2 at 30 min, pill 3 at 60 min. That's 60 minutes total.",
    category: "math",
  },
  {
    id: "math4",
    question: "If there are 3 apples and you take away 2, how many apples do you have?",
    options: ["1", "2", "3", "0"],
    correctIndex: 1,
    explanation: "You TOOK 2 apples — so you have 2. The pile has 1 left, but you have 2.",
    category: "lateral",
  },
  {
    id: "holes",
    question: "What has many holes but can still hold water?",
    options: ["A net", "A cloud", "A sponge", "A colander"],
    correctIndex: 2,
    explanation: "A sponge is full of small holes (pores) but absorbs and holds water in those very holes.",
    category: "classic",
  },
  {
    id: "stairs",
    question: "What goes up but never comes down?",
    options: ["A balloon", "Your age", "A kite", "Smoke"],
    correctIndex: 1,
    explanation: "Your age only increases — it can never go back down.",
    category: "classic",
  },
  {
    id: "dark",
    question: "I'm light as a feather, yet the strongest person can't hold me for more than a few minutes. What am I?",
    options: ["A thought", "Air", "Breath", "A secret"],
    correctIndex: 2,
    explanation: "Your breath is extremely light, but no one can hold their breath indefinitely.",
    category: "classic",
  },
  {
    id: "river",
    question: "The more you remove from me, the bigger I get. What am I?",
    options: ["A balloon", "A hole", "A shadow", "A debt"],
    correctIndex: 1,
    explanation: "A hole gets bigger the more material you remove from it.",
    category: "classic",
  },
  {
    id: "coin",
    question: "What has a head and a tail but no body?",
    options: ["A snake", "A comet", "A coin", "A bookmark"],
    correctIndex: 2,
    explanation: "A coin has a 'head' side and a 'tail' side but is flat with no body.",
    category: "classic",
  },
  {
    id: "clock",
    question: "What runs but never walks, has a mouth but never talks, has a bed but never sleeps?",
    options: ["A computer", "A river", "A dream", "A clock"],
    correctIndex: 1,
    explanation: "A river runs (flows), has a mouth (where it meets the sea), and has a bed (riverbed).",
    category: "classic",
  },
  {
    id: "blind",
    question: "Three blind men each have a sister, yet no two sisters are related. How is that possible?",
    options: ["They are cousins", "The sisters are friends, not family", "They are different people with the same name", "Each man is the other's sister's brother"],
    correctIndex: 3,
    explanation: "Each blind man is the brother of the other two men's sisters. The men ARE the sisters' brothers — they are siblings.",
    category: "lateral",
  },
  {
    id: "yesterday",
    question: "When does yesterday come after today?",
    options: ["In a time machine", "Never", "In the dictionary", "On a leap year"],
    correctIndex: 2,
    explanation: "In the dictionary, 'yesterday' appears after 'today' alphabetically (y comes after t in... wait — actually 'today' comes before 'tomorrow' and after 'yesterday' in the dictionary. The letter Y comes after T, so 'yesterday' appears after 'today' in a dictionary.)",
    category: "wordplay",
  },
  {
    id: "window",
    question: "I have no life but I can die. What am I?",
    options: ["A robot", "A computer", "A battery", "A fire"],
    correctIndex: 3,
    explanation: "Fire is not alive, but it can 'die' — be extinguished — when it runs out of fuel or oxygen.",
    category: "classic",
  },
];

function shuffle(arr: number[], rng: () => number): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: RiddleSettings): RiddleState {
  const rng = mulberry32(seed);
  const indices = shuffle(Array.from({ length: RIDDLES.length }, (_, i) => i), rng);
  return {
    settings,
    rngSeed: seed,
    queue: indices,
    currentIndex: 0,
    selectedOption: null,
    submitted: false,
    correct: false,
    totalScore: 0,
    roundScore: 0,
    streak: 0,
    answered: 0,
  };
}

export function reducer(state: RiddleState, action: RiddleAction): RiddleState {
  if (state.submitted && action.type !== "next") return state;
  switch (action.type) {
    case "selectOption":
      return { ...state, selectedOption: action.option };
    case "submit": {
      if (state.selectedOption === null) return state;
      const riddle = RIDDLES[state.queue[state.currentIndex]!]!;
      const correct = state.selectedOption === riddle.correctIndex;
      const streak = correct ? state.streak + 1 : 0;
      const roundScore = correct ? 200 + streak * 50 : 0;
      return {
        ...state,
        submitted: true,
        correct,
        streak,
        roundScore,
        totalScore: state.totalScore + roundScore,
        answered: state.answered + 1,
      };
    }
    case "next": {
      const nextIndex = (state.currentIndex + 1) % state.queue.length;
      return {
        ...state,
        currentIndex: nextIndex,
        selectedOption: null,
        submitted: false,
        correct: false,
        roundScore: 0,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: RiddleState): { score: number } | null {
  if (!state.submitted) return null;
  return { score: state.totalScore };
}
