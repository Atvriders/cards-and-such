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
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many legs does an insect have?", choices: ["4", "6", "8", "10"], correct: 1 },
  { question: "Which insect produces honey?", choices: ["Wasp", "Bumblebee", "Honeybee", "Hornet"], correct: 2 },
  { question: "What is the larva of a butterfly called?", choices: ["Nymph", "Maggot", "Caterpillar", "Grub"], correct: 2 },
  { question: "Which insect can lift 50 times its own weight?", choices: ["Beetle", "Grasshopper", "Ant", "Termite"], correct: 2 },
  { question: "What is a group of bees called?", choices: ["Colony", "Swarm", "Hive", "Cluster"], correct: 1 },
  { question: "Which insect has the longest lifespan?", choices: ["Dragonfly", "Mayfly", "Cicada", "Locust"], correct: 2 },
  { question: "What do fireflies use to communicate?", choices: ["Sound", "Chemical signals", "Light", "Touch"], correct: 2 },
  { question: "Which insect is the fastest runner?", choices: ["Cockroach", "Tiger beetle", "Ant", "Dragonfly"], correct: 1 },
  { question: "How many eyes does a dragonfly have?", choices: ["2", "4", "2 compound + 3 simple", "6"], correct: 2 },
  { question: "What is the pupal stage of a moth called?", choices: ["Chrysalis", "Cocoon", "Larva", "Nymph"], correct: 1 },
  { question: "Which insect is known for its role in pollination besides bees?", choices: ["Moth", "Butterfly", "Both moth and butterfly", "Housefly"], correct: 2 },
  { question: "What type of metamorphosis do grasshoppers undergo?", choices: ["Complete", "Incomplete", "No metamorphosis", "Partial"], correct: 1 },
  { question: "Which beetle is the heaviest insect?", choices: ["Rhinoceros beetle", "Goliath beetle", "Titan beetle", "Hercules beetle"], correct: 1 },
  { question: "What do stick insects mimic?", choices: ["Leaves", "Bark", "Twigs and sticks", "Flowers"], correct: 2 },
  { question: "How do mosquitoes detect humans?", choices: ["Vision only", "Carbon dioxide and heat", "Sound", "Light"], correct: 1 },
  { question: "Which insect carries malaria?", choices: ["Tsetse fly", "Female Anopheles mosquito", "Sandfly", "Blackfly"], correct: 1 },
  { question: "What is the scientific study of insects called?", choices: ["Arachnology", "Entomology", "Zoology", "Taxonomy"], correct: 1 },
  { question: "Which insect produces silk?", choices: ["Moth caterpillar", "Silkworm (Bombyx mori)", "Weaver ant", "Lacewing larva"], correct: 1 },
  { question: "How many wings does a bee have?", choices: ["2", "4", "6", "0"], correct: 1 },
  { question: "Which insect can walk on water?", choices: ["Water boatman", "Diving beetle", "Pond skater", "Backswimmer"], correct: 2 },
  { question: "What is the resting stage between larva and adult called?", choices: ["Nymph", "Pupa", "Instar", "Imago"], correct: 1 },
  { question: "Which order do beetles belong to?", choices: ["Lepidoptera", "Diptera", "Coleoptera", "Hymenoptera"], correct: 2 },
  { question: "How do crickets produce sound?", choices: ["Rubbing wings", "Vibrating membranes", "Leg rubbing", "Wing beats"], correct: 0 },
  { question: "Which insect has the shortest adult lifespan?", choices: ["Housefly", "Mayfly", "Fruit fly", "Gnat"], correct: 1 },
  { question: "What is the name for an insect's external skeleton?", choices: ["Shell", "Exoskeleton", "Carapace", "Cuticle"], correct: 1 },
  { question: "Which insect builds the most complex nests?", choices: ["Wasp", "Honeybee", "Termite", "Weaver ant"], correct: 2 },
  { question: "What are the three body segments of an insect?", choices: ["Head, thorax, abdomen", "Head, chest, tail", "Thorax, abdomen, legs", "Antennae, body, legs"], correct: 0 },
  { question: "Which insect has pheromone communication most studied?", choices: ["Firefly", "Ant", "Mosquito", "Moth"], correct: 3 },
  { question: "How many segments does an ant's antenna have?", choices: ["6", "9", "12 including scape", "4"], correct: 2 },
  { question: "What is a locust?", choices: ["A type of ant", "A phase of certain grasshoppers", "A flying beetle", "A water bug"], correct: 1 },
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
    case "select": if (state.submitted) return state; return { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const points = isCorrect ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const t = state.timeLeft - 1;
      if (t <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" };
      return { ...state, timeLeft: t };
    }
    case "next": {
      const next = state.currentIndex + 1;
      if (next >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: next, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
