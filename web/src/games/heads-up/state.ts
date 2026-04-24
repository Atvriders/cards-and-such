import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type HeadsUpDeck = "celebrities" | "animals" | "movies" | "objects" | "mixed";

export interface HeadsUpSettings {
  timeLimit: "30" | "60" | "90";
  deck: HeadsUpDeck;
}

const WORDS: Record<Exclude<HeadsUpDeck, "mixed">, string[]> = {
  celebrities: [
    "Oprah Winfrey", "Elon Musk", "Taylor Swift", "LeBron James", "Beyoncé",
    "Barack Obama", "Albert Einstein", "Leonardo DiCaprio", "Lady Gaga", "Cristiano Ronaldo",
    "Serena Williams", "Bill Gates", "Marilyn Monroe", "Michael Jordan", "Adele",
    "Tom Hanks", "Rihanna", "Kanye West", "Morgan Freeman", "Katy Perry",
    "Dwayne Johnson", "Shakira", "Lionel Messi", "Celine Dion", "Steve Jobs",
    "Justin Bieber", "Ellen DeGeneres", "Drake", "Angelina Jolie", "Tiger Woods",
  ],
  animals: [
    "Elephant", "Flamingo", "Giraffe", "Kangaroo", "Narwhal",
    "Platypus", "Chimpanzee", "Manta Ray", "Octopus", "Polar Bear",
    "Peacock", "Wolverine", "Axolotl", "Capybara", "Komodo Dragon",
    "Pangolin", "Tarantula", "Hammerhead Shark", "Sea Turtle", "Slow Loris",
    "Mantis Shrimp", "Puffer Fish", "Snow Leopard", "Quokka", "Aye-aye",
    "Blobfish", "Goblin Shark", "Mimic Octopus", "Star-nosed Mole", "Red Panda",
  ],
  movies: [
    "Titanic", "Jurassic Park", "The Matrix", "Inception", "Avengers",
    "Forrest Gump", "The Lion King", "Home Alone", "Star Wars", "Back to the Future",
    "The Wizard of Oz", "Ghostbusters", "Indiana Jones", "Grease", "Frozen",
    "The Godfather", "Shrek", "Finding Nemo", "Rocky", "Jaws",
    "Interstellar", "The Dark Knight", "Gladiator", "Avatar", "Moana",
    "The Truman Show", "Cast Away", "Big Hero 6", "Zootopia", "Coco",
  ],
  objects: [
    "Umbrella", "Telescope", "Microwave", "Trampoline", "Compass",
    "Saxophone", "Periscope", "Boomerang", "Accordion", "Typewriter",
    "Magnifying Glass", "Kaleidoscope", "Sundial", "Metronome", "Abacus",
    "Lava Lamp", "Gramophone", "Pinball Machine", "Bowling Ball", "Snowglobe",
    "Thermos", "Blender", "Toaster", "Percolator", "Pendulum",
    "Sextant", "Astrolabe", "Barometer", "Compass", "Harmonica",
  ],
};

const ALL_WORDS: string[] = [
  ...WORDS.celebrities,
  ...WORDS.animals,
  ...WORDS.movies,
  ...WORDS.objects,
];

export interface HeadsUpState {
  settings: HeadsUpSettings;
  words: string[];
  currentIndex: number;
  guessed: number;
  skipped: number;
  timeLeft: number;
  phase: "playing" | "done";
}

export type HeadsUpAction =
  | { type: "tick" }
  | { type: "correct" }
  | { type: "skip" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: HeadsUpSettings): HeadsUpState {
  const rng = mulberry32(seed);
  const pool = settings.deck === "mixed" ? ALL_WORDS : WORDS[settings.deck];
  const words = shuffle(pool, rng);
  const timeLimit = parseInt(settings.timeLimit, 10);
  return { settings, words, currentIndex: 0, guessed: 0, skipped: 0, timeLeft: timeLimit, phase: "playing" };
}

export function reducer(state: HeadsUpState, action: HeadsUpAction): HeadsUpState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "tick": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, phase: "done" };
      return { ...state, timeLeft: newTime };
    }
    case "correct": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.words.length) return { ...state, guessed: state.guessed + 1, phase: "done" };
      return { ...state, guessed: state.guessed + 1, currentIndex: nextIndex };
    }
    case "skip": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.words.length) return { ...state, skipped: state.skipped + 1, phase: "done" };
      return { ...state, skipped: state.skipped + 1, currentIndex: nextIndex };
    }
    default:
      return state;
  }
}

export function isTerminal(state: HeadsUpState): { score: number } | null {
  if (state.phase === "done") return { score: state.guessed };
  return null;
}
