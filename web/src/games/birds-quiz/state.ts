import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface BirdsQuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type BirdsQuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface BirdsQuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is the largest bird in the world by height?", choices: ["Emu", "Ostrich", "Rhea", "Cassowary"], correct: 1 },
  { question: "Which bird has the longest wingspan?", choices: ["Bald eagle", "Wandering albatross", "Condor", "Pelican"], correct: 1 },
  { question: "Which bird can fly backwards?", choices: ["Kingfisher", "Hummingbird", "Swift", "Swallow"], correct: 1 },
  { question: "The Peregrine falcon is the fastest animal. Its dive speed can reach?", choices: ["200 km/h", "240 km/h", "320 km/h", "390 km/h"], correct: 2 },
  { question: "Which bird is known for its elaborate courtship dance to attract mates?", choices: ["Flamingo", "Bird of paradise", "Peacock", "Crane"], correct: 1 },
  { question: "A group of crows is called a?", choices: ["Flock", "Murder", "Parliament", "Colony"], correct: 1 },
  { question: "Which bird lays the largest egg relative to its body size?", choices: ["Kiwi", "Ostrich", "Albatross", "Penguin"], correct: 0 },
  { question: "Which bird is the national symbol of the USA?", choices: ["Bald eagle", "Turkey", "Great blue heron", "American robin"], correct: 0 },
  { question: "Penguins are found natively on which continent?", choices: ["North America", "Africa", "Antarctica", "Asia"], correct: 2 },
  { question: "Which bird is famous for its mimic ability and can imitate other birds and sounds?", choices: ["Parrot", "Lyrebird", "Mockingbird", "Starling"], correct: 1 },
  { question: "How many species of birds exist approximately?", choices: ["4,000", "7,000", "10,000", "15,000"], correct: 2 },
  { question: "Which bird builds the largest nest?", choices: ["Bald eagle", "Sociable weaver", "Osprey", "Stork"], correct: 1 },
  { question: "Flamingos get their pink color from?", choices: ["Genetics", "Sunlight", "Carotenoid pigments in food", "Water minerals"], correct: 2 },
  { question: "Which is the only continent with no native bird species?", choices: ["Antarctica", "No such continent", "Greenland", "Iceland"], correct: 1 },
  { question: "A group of owls is called a?", choices: ["Flock", "Parliament", "Colony", "Gaggle"], correct: 1 },
  { question: "Which bird cannot fly and is found in Australia?", choices: ["Kiwi", "Rhea", "Emu", "Cassowary"], correct: 2 },
  { question: "Which is the smallest bird in the world?", choices: ["Bee hummingbird", "Goldcrest", "Brown creeper", "Pygmy owl"], correct: 0 },
  { question: "Which bird is known to have the best sense of smell among birds?", choices: ["Vulture", "Albatross", "Kiwi", "Turkey vulture"], correct: 2 },
  { question: "Swifts are remarkable because they?", choices: ["Never drink water", "Can sleep while flying", "Live entirely at sea", "Mate for life only"], correct: 1 },
  { question: "Which bird was used to carry messages during World War I?", choices: ["Eagle", "Pigeon", "Sparrow", "Raven"], correct: 1 },
  { question: "The Arctic tern has the longest migration. It travels approximately?", choices: ["10,000 km/year", "20,000 km/year", "70,000 km/year", "50,000 km/year"], correct: 2 },
  { question: "Which bird has eyes that face forward like human eyes?", choices: ["Hawk", "Eagle", "Owl", "Crane"], correct: 2 },
  { question: "Male birds of which species are typically more colorful?", choices: ["Females are more colorful", "Males are generally more colorful", "Color is equal", "It varies with species randomly"], correct: 1 },
  { question: "Woodpeckers protect their brains from hammering because they have?", choices: ["Thick skulls only", "Thick beak only", "Spongy bone and strong neck muscles", "Special fluid cushion"], correct: 2 },
  { question: "Which bird is known as the 'laughing' bird due to its call?", choices: ["Kookaburra", "Hyena bird", "Laughing falcon", "Jay"], correct: 0 },
  { question: "What is special about the oilbird?", choices: ["It can see UV light", "It is nocturnal and uses echolocation", "It eats only oil-rich fish", "It has no feathers"], correct: 1 },
  { question: "The cassowary is considered one of the most dangerous birds because?", choices: ["Its beak can crush bone", "It has venomous claws", "Its powerful kick and dagger-like claws", "It spits acid"], correct: 2 },
  { question: "Seagulls drink?", choices: ["Only freshwater", "Saltwater, filtered by glands", "No water at all", "Rainwater only"], correct: 1 },
  { question: "What is a group of flamingos called?", choices: ["Flock", "Flamboyance", "Colony", "Band"], correct: 1 },
  { question: "Which bird has the most feathers?", choices: ["Swan", "Eagle", "Penguin", "Ostrich"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: BirdsQuizSettings): BirdsQuizState {
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

export function reducer(state: BirdsQuizState, action: BirdsQuizAction): BirdsQuizState {
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

export function isTerminal(state: BirdsQuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
