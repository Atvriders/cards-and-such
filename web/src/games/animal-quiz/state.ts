import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type QuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface QuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is the largest land animal on Earth?", choices: ["Hippopotamus", "White rhinoceros", "African elephant", "Giraffe"], correct: 2 },
  { question: "How many hearts does an octopus have?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Which animal has the longest lifespan?", choices: ["Giant tortoise", "Greenland shark", "Bowhead whale", "Ocean quahog clam"], correct: 3 },
  { question: "A group of flamingos is called a?", choices: ["Flock", "Colony", "Flamboyance", "Murder"], correct: 2 },
  { question: "Which mammal can fly?", choices: ["Flying squirrel", "Sugar glider", "Bat", "Flying lemur"], correct: 2 },
  { question: "The blue whale is the largest animal. How long can it get?", choices: ["20 meters", "25 meters", "30 meters", "35 meters"], correct: 2 },
  { question: "What is a young kangaroo called?", choices: ["Pup", "Cub", "Joey", "Foal"], correct: 2 },
  { question: "Which animal has the strongest bite force?", choices: ["Lion", "Hippopotamus", "Saltwater crocodile", "Great white shark"], correct: 2 },
  { question: "How many legs does a spider have?", choices: ["6", "7", "8", "10"], correct: 2 },
  { question: "Which animal is known as the 'King of the Jungle'?", choices: ["Tiger", "Leopard", "Cheetah", "Lion"], correct: 3 },
  { question: "Dolphins communicate through?", choices: ["Body language only", "Chemical signals", "Echolocation and sounds", "Electrical signals"], correct: 2 },
  { question: "Which reptile can change color to blend with surroundings?", choices: ["Gecko", "Iguana", "Chameleon", "Monitor lizard"], correct: 2 },
  { question: "Which bird has the largest wingspan?", choices: ["Bald eagle", "Albatross", "Condor", "Pelican"], correct: 1 },
  { question: "A group of wolves is called a?", choices: ["Herd", "Pack", "Pride", "Band"], correct: 1 },
  { question: "Which animal produces the loudest sound?", choices: ["Sperm whale", "Blue whale", "Howler monkey", "Elephant"], correct: 1 },
  { question: "How do sharks detect prey in dark water?", choices: ["Infrared vision", "Sonar", "Electroreception (ampullae of Lorenzini)", "Scent only"], correct: 2 },
  { question: "The cheetah is the fastest land animal. Its top speed is approximately?", choices: ["70 km/h", "80 km/h", "100 km/h", "120 km/h"], correct: 2 },
  { question: "Which insect is the most deadly to humans (through disease)?", choices: ["Tsetse fly", "Mosquito", "Hornet", "Fire ant"], correct: 1 },
  { question: "A 'murder' is the collective noun for a group of?", choices: ["Ravens", "Crows", "Vultures", "Jackdaws"], correct: 1 },
  { question: "Which animal has fingerprints similar to humans?", choices: ["Gorilla", "Chimpanzee", "Koala", "Orangutan"], correct: 2 },
  { question: "How many chambers does a cow's stomach have?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "Which fish is known to be able to walk on land?", choices: ["Mudskipper", "Flying fish", "Lungfish", "Archerfish"], correct: 0 },
  { question: "What is the only mammal native to both North and South America?", choices: ["Jaguar", "Tapir", "Puma", "Virginia opossum"], correct: 3 },
  { question: "The largest spider in the world is the?", choices: ["Wolf spider", "Goliath birdeater", "Giant huntsman", "King baboon"], correct: 1 },
  { question: "How do sea otters keep warm?", choices: ["Thick blubber", "Dense fur trapping air", "Increased metabolism", "Basking in sunlight"], correct: 1 },
  { question: "Which animal is immune to snake venom?", choices: ["Mongoose", "Honey badger", "Secretary bird", "Hedgehog"], correct: 0 },
  { question: "Which is the only continent with no native snake species?", choices: ["Greenland", "Iceland", "Antarctica", "Ireland"], correct: 2 },
  { question: "How many eyes does a bee have?", choices: ["2", "3", "4", "5"], correct: 3 },
  { question: "What do giant pandas primarily eat?", choices: ["Fish", "Bamboo", "Fruit", "Insects"], correct: 1 },
  { question: "A young deer is called a?", choices: ["Lamb", "Kid", "Fawn", "Foal"], correct: 2 },
  { question: "Which animal can sleep standing up?", choices: ["Elephant", "Giraffe", "Horse", "Hippopotamus"], correct: 2 },
  { question: "The axolotl is a species of?", choices: ["Fish", "Frog", "Salamander", "Lizard"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng);
  pool = pool.slice(0, Math.min(count, pool.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: QuizState, action: QuizAction): QuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": {
      if (state.submitted) return state;
      return { ...state, selected: action.choice };
    }
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const speedBonus = isCorrect ? Math.floor(state.timeLeft * 10) : 0;
      const points = isCorrect ? 100 + speedBonus : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" };
      return { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
