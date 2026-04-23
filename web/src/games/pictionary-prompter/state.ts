import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type PictionaryCategory = "mixed" | "objects" | "animals" | "places" | "actions" | "food";

export interface PictionarySettings {
  duration: "60" | "120" | "180";
  category: PictionaryCategory;
}

export type PictionaryDifficulty = "easy" | "medium" | "hard";

export interface PictionaryPrompt {
  word: string;
  category: Exclude<PictionaryCategory, "mixed">;
  difficulty: PictionaryDifficulty;
}

const ALL_PROMPTS: PictionaryPrompt[] = [
  // Objects
  { word: "Umbrella", category: "objects", difficulty: "easy" },
  { word: "Scissors", category: "objects", difficulty: "easy" },
  { word: "Telephone", category: "objects", difficulty: "easy" },
  { word: "Bicycle", category: "objects", difficulty: "easy" },
  { word: "Mailbox", category: "objects", difficulty: "easy" },
  { word: "Clock", category: "objects", difficulty: "easy" },
  { word: "Glasses", category: "objects", difficulty: "easy" },
  { word: "Ladder", category: "objects", difficulty: "easy" },
  { word: "Compass", category: "objects", difficulty: "medium" },
  { word: "Microscope", category: "objects", difficulty: "medium" },
  { word: "Boomerang", category: "objects", difficulty: "medium" },
  { word: "Thermometer", category: "objects", difficulty: "medium" },
  { word: "Periscope", category: "objects", difficulty: "medium" },
  { word: "Telescope", category: "objects", difficulty: "medium" },
  { word: "Kaleidoscope", category: "objects", difficulty: "hard" },
  { word: "Sextant", category: "objects", difficulty: "hard" },
  { word: "Astrolabe", category: "objects", difficulty: "hard" },
  { word: "Stapler", category: "objects", difficulty: "easy" },
  { word: "Paperclip", category: "objects", difficulty: "easy" },
  { word: "Shovel", category: "objects", difficulty: "easy" },
  { word: "Wrench", category: "objects", difficulty: "medium" },
  { word: "Fire Hydrant", category: "objects", difficulty: "medium" },
  { word: "Megaphone", category: "objects", difficulty: "medium" },
  { word: "Submarine", category: "objects", difficulty: "medium" },
  { word: "Parachute", category: "objects", difficulty: "medium" },

  // Animals
  { word: "Penguin", category: "animals", difficulty: "easy" },
  { word: "Giraffe", category: "animals", difficulty: "easy" },
  { word: "Elephant", category: "animals", difficulty: "easy" },
  { word: "Octopus", category: "animals", difficulty: "easy" },
  { word: "Kangaroo", category: "animals", difficulty: "easy" },
  { word: "Flamingo", category: "animals", difficulty: "easy" },
  { word: "Peacock", category: "animals", difficulty: "easy" },
  { word: "Rhinoceros", category: "animals", difficulty: "medium" },
  { word: "Chameleon", category: "animals", difficulty: "medium" },
  { word: "Platypus", category: "animals", difficulty: "medium" },
  { word: "Narwhal", category: "animals", difficulty: "medium" },
  { word: "Axolotl", category: "animals", difficulty: "hard" },
  { word: "Pangolin", category: "animals", difficulty: "hard" },
  { word: "Tardigrade", category: "animals", difficulty: "hard" },
  { word: "Capybara", category: "animals", difficulty: "medium" },
  { word: "Manta Ray", category: "animals", difficulty: "medium" },
  { word: "Komodo Dragon", category: "animals", difficulty: "medium" },
  { word: "Porcupine", category: "animals", difficulty: "easy" },
  { word: "Armadillo", category: "animals", difficulty: "medium" },
  { word: "Jellyfish", category: "animals", difficulty: "easy" },
  { word: "Toucan", category: "animals", difficulty: "easy" },
  { word: "Walrus", category: "animals", difficulty: "easy" },
  { word: "Sloth", category: "animals", difficulty: "easy" },
  { word: "Otter", category: "animals", difficulty: "easy" },
  { word: "Mantis Shrimp", category: "animals", difficulty: "hard" },

  // Places
  { word: "Lighthouse", category: "places", difficulty: "easy" },
  { word: "Volcano", category: "places", difficulty: "easy" },
  { word: "Waterfall", category: "places", difficulty: "easy" },
  { word: "Pyramid", category: "places", difficulty: "easy" },
  { word: "Windmill", category: "places", difficulty: "easy" },
  { word: "Hot Air Balloon", category: "places", difficulty: "medium" },
  { word: "Submarine Base", category: "places", difficulty: "medium" },
  { word: "Igloo", category: "places", difficulty: "easy" },
  { word: "Treehouse", category: "places", difficulty: "easy" },
  { word: "Castle", category: "places", difficulty: "easy" },
  { word: "Skyscraper", category: "places", difficulty: "medium" },
  { word: "Canyon", category: "places", difficulty: "medium" },
  { word: "Glacier", category: "places", difficulty: "medium" },
  { word: "Coral Reef", category: "places", difficulty: "medium" },
  { word: "Swamp", category: "places", difficulty: "easy" },
  { word: "Bayou", category: "places", difficulty: "hard" },
  { word: "Tundra", category: "places", difficulty: "medium" },
  { word: "Oasis", category: "places", difficulty: "medium" },
  { word: "Fjord", category: "places", difficulty: "hard" },
  { word: "Archipelago", category: "places", difficulty: "hard" },
  { word: "Stadium", category: "places", difficulty: "easy" },
  { word: "Observatory", category: "places", difficulty: "medium" },
  { word: "Greenhouse", category: "places", difficulty: "easy" },
  { word: "Labyrinth", category: "places", difficulty: "hard" },
  { word: "Colosseum", category: "places", difficulty: "medium" },

  // Actions
  { word: "Swimming", category: "actions", difficulty: "easy" },
  { word: "Juggling", category: "actions", difficulty: "easy" },
  { word: "Surfing", category: "actions", difficulty: "easy" },
  { word: "Skydiving", category: "actions", difficulty: "medium" },
  { word: "Cooking", category: "actions", difficulty: "easy" },
  { word: "Painting", category: "actions", difficulty: "easy" },
  { word: "Climbing", category: "actions", difficulty: "easy" },
  { word: "Meditating", category: "actions", difficulty: "medium" },
  { word: "Snoring", category: "actions", difficulty: "easy" },
  { word: "Sleepwalking", category: "actions", difficulty: "medium" },
  { word: "Tightrope Walking", category: "actions", difficulty: "medium" },
  { word: "Knitting", category: "actions", difficulty: "easy" },
  { word: "Conducting an Orchestra", category: "actions", difficulty: "hard" },
  { word: "Bungee Jumping", category: "actions", difficulty: "medium" },
  { word: "Breakdancing", category: "actions", difficulty: "medium" },
  { word: "Sword Swallowing", category: "actions", difficulty: "hard" },
  { word: "Hypnotizing", category: "actions", difficulty: "hard" },
  { word: "Photographing", category: "actions", difficulty: "easy" },
  { word: "Gardening", category: "actions", difficulty: "easy" },
  { word: "Fishing", category: "actions", difficulty: "easy" },
  { word: "Archery", category: "actions", difficulty: "easy" },
  { word: "Fencing", category: "actions", difficulty: "medium" },
  { word: "Origami", category: "actions", difficulty: "medium" },
  { word: "Stargazing", category: "actions", difficulty: "medium" },
  { word: "Ventriloquism", category: "actions", difficulty: "hard" },

  // Food
  { word: "Pizza", category: "food", difficulty: "easy" },
  { word: "Sushi", category: "food", difficulty: "easy" },
  { word: "Tacos", category: "food", difficulty: "easy" },
  { word: "Spaghetti", category: "food", difficulty: "easy" },
  { word: "Croissant", category: "food", difficulty: "medium" },
  { word: "Avocado", category: "food", difficulty: "easy" },
  { word: "Pomegranate", category: "food", difficulty: "medium" },
  { word: "Bruschetta", category: "food", difficulty: "hard" },
  { word: "Quesadilla", category: "food", difficulty: "medium" },
  { word: "Ramen", category: "food", difficulty: "easy" },
  { word: "Fondue", category: "food", difficulty: "medium" },
  { word: "Paella", category: "food", difficulty: "hard" },
  { word: "Soufflé", category: "food", difficulty: "hard" },
  { word: "Gazpacho", category: "food", difficulty: "hard" },
  { word: "Gyoza", category: "food", difficulty: "medium" },
  { word: "Baklava", category: "food", difficulty: "hard" },
  { word: "Tempura", category: "food", difficulty: "medium" },
  { word: "Baguette", category: "food", difficulty: "medium" },
  { word: "Chimichanga", category: "food", difficulty: "hard" },
  { word: "Bibimbap", category: "food", difficulty: "hard" },
  { word: "Waffles", category: "food", difficulty: "easy" },
  { word: "Dumpling", category: "food", difficulty: "easy" },
  { word: "Pretzel", category: "food", difficulty: "easy" },
  { word: "Macaron", category: "food", difficulty: "medium" },
  { word: "Churros", category: "food", difficulty: "easy" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export interface PictionaryState {
  settings: PictionarySettings;
  prompts: PictionaryPrompt[];
  currentIndex: number;
  completedCount: number;
  skippedCount: number;
  timeLeft: number;
  phase: "playing" | "done";
}

export type PictionaryAction =
  | { type: "complete" }
  | { type: "skip" }
  | { type: "tick" };

export function initialState(seed: number, settings: PictionarySettings): PictionaryState {
  const rng = mulberry32(seed);
  const duration = parseInt(settings.duration, 10);
  const pool = settings.category === "mixed"
    ? ALL_PROMPTS
    : ALL_PROMPTS.filter(p => p.category === settings.category);
  const shuffled = shuffle(pool, rng);

  return {
    settings,
    prompts: shuffled,
    currentIndex: 0,
    completedCount: 0,
    skippedCount: 0,
    timeLeft: duration,
    phase: "playing",
  };
}

export function reducer(state: PictionaryState, action: PictionaryAction): PictionaryState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "complete": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.prompts.length) {
        return { ...state, phase: "done", completedCount: state.completedCount + 1 };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        completedCount: state.completedCount + 1,
      };
    }

    case "skip": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.prompts.length) {
        return { ...state, phase: "done", skippedCount: state.skippedCount + 1 };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        skippedCount: state.skippedCount + 1,
      };
    }

    case "tick": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, phase: "done" };
      }
      return { ...state, timeLeft: newTime };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PictionaryState): { score: number } | null {
  if (state.phase === "done") return { score: state.completedCount };
  return null;
}
