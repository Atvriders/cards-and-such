import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface PlantsQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type PlantsQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface PlantsQuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which process do plants use to make food from sunlight?", choices: ["Respiration", "Photosynthesis", "Transpiration", "Fermentation"], correct: 1 },
  { question: "The world's largest flower is?", choices: ["Titan arum", "Rafflesia arnoldii", "Sunflower", "Victoria amazonica"], correct: 1 },
  { question: "Which part of the plant absorbs water and minerals from the soil?", choices: ["Leaves", "Stem", "Roots", "Flowers"], correct: 2 },
  { question: "What gas do plants absorb during photosynthesis?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2 },
  { question: "The Venus flytrap is a carnivorous plant native to?", choices: ["Amazon rainforest", "North and South Carolina, USA", "Southeast Asia", "Australia"], correct: 1 },
  { question: "Which tree is the tallest in the world?", choices: ["Giant sequoia", "Douglas fir", "Coast redwood", "Blue gum"], correct: 2 },
  { question: "What is the oldest known living organism?", choices: ["Giant sequoia", "Bristlecone pine", "Yew tree", "Creosote bush clone"], correct: 3 },
  { question: "Which plant has the fastest growth rate?", choices: ["Kudzu vine", "Bamboo", "Jack bean", "Duckweed"], correct: 1 },
  { question: "What is the study of plants called?", choices: ["Zoology", "Botany", "Ecology", "Mycology"], correct: 1 },
  { question: "Which plant part produces pollen?", choices: ["Pistil", "Sepal", "Stamen", "Ovary"], correct: 2 },
  { question: "Cacti are adapted to dry climates by?", choices: ["Having no roots", "Storing water in their stems", "Absorbing water from air", "Closing stomata forever"], correct: 1 },
  { question: "Which vitamin do plants make that humans cannot synthesize efficiently?", choices: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], correct: 1 },
  { question: "Chlorophyll gives plants their green color. What does chlorophyll primarily absorb?", choices: ["Green light", "All wavelengths equally", "Red and blue light", "Yellow light"], correct: 2 },
  { question: "Which of these is a gymnosperm (does not flower)?", choices: ["Oak", "Rose", "Pine", "Sunflower"], correct: 2 },
  { question: "Mangrove trees are special because they grow in?", choices: ["Desert sand", "Saltwater coastal areas", "Alpine tundra", "Pure freshwater only"], correct: 1 },
  { question: "What is the female reproductive part of a flower?", choices: ["Stamen", "Anther", "Pistil", "Filament"], correct: 2 },
  { question: "Which tree produces acorns?", choices: ["Maple", "Birch", "Oak", "Walnut"], correct: 2 },
  { question: "Penicillin was discovered from?", choices: ["A plant", "A fungus (Penicillium mold)", "A bacterium", "An alga"], correct: 1 },
  { question: "Which part of a plant conducts water upward from the roots?", choices: ["Phloem", "Epidermis", "Xylem", "Cortex"], correct: 2 },
  { question: "Which tree is known as the 'lungs of the Earth'?", choices: ["Boreal forest", "Amazon rainforest", "Congo rainforest", "All rainforests collectively"], correct: 3 },
  { question: "Seaweed is classified as a(n)?", choices: ["Plant", "Fungus", "Alga", "Bacterium"], correct: 2 },
  { question: "Which spice comes from the bark of a tree?", choices: ["Pepper", "Cinnamon", "Turmeric", "Cardamom"], correct: 1 },
  { question: "A plant that completes its life cycle in one growing season is called?", choices: ["Perennial", "Biennial", "Annual", "Deciduous"], correct: 2 },
  { question: "Mistletoe is a?", choices: ["Parasitic plant", "Saprophyte", "Carnivorous plant", "Nitrogen fixer"], correct: 0 },
  { question: "Which plant is used to make linen fabric?", choices: ["Cotton", "Hemp", "Flax", "Jute"], correct: 2 },
  { question: "What is the process called when water vapor escapes from plant leaves?", choices: ["Evaporation", "Transpiration", "Osmosis", "Diffusion"], correct: 1 },
  { question: "Which nutrient do legumes (beans, peas) add to the soil?", choices: ["Phosphorus", "Potassium", "Nitrogen", "Iron"], correct: 2 },
  { question: "A plant that loses its leaves seasonally is called?", choices: ["Evergreen", "Deciduous", "Coniferous", "Perennial"], correct: 1 },
  { question: "Which famous botanist developed the binomial naming system for species?", choices: ["Charles Darwin", "Carl Linnaeus", "Gregor Mendel", "Alexander von Humboldt"], correct: 1 },
  { question: "Which plant is the source of aspirin's active ingredient?", choices: ["Oak tree", "Willow tree", "Birch tree", "Poplar tree"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: PlantsQuizSettings): PlantsQuizState {
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

export function reducer(state: PlantsQuizState, action: PlantsQuizAction): PlantsQuizState {
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

export function isTerminal(state: PlantsQuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
