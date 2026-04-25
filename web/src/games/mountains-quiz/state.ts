import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the tallest mountain on Earth?", choices: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correct: 2 },
  { question: "How tall is Mount Everest?", choices: ["8,611 m", "8,849 m", "8,516 m", "8,201 m"], correct: 1 },
  { question: "Which mountain range is the longest in the world?", choices: ["Himalayas", "Rocky Mountains", "Andes", "Alps"], correct: 2 },
  { question: "What is the highest mountain in North America?", choices: ["Logan", "Denali (McKinley)", "Pico de Orizaba", "Whitney"], correct: 1 },
  { question: "Which mountain range contains Everest?", choices: ["Karakoram", "Himalayas", "Hindu Kush", "Pamir"], correct: 1 },
  { question: "What is the tallest mountain from Earth's center?", choices: ["Everest", "Denali", "Chimborazo", "Mauna Kea"], correct: 2 },
  { question: "Which is the tallest mountain fully underwater?", choices: ["Seamount Vailulu'u", "Mauna Kea (base to summit)", "Mid-Atlantic Ridge", "Emporer Seamount"], correct: 1 },
  { question: "Who first summited Everest?", choices: ["George Mallory", "Edmund Hillary and Tenzing Norgay", "Reinhold Messner", "Chris Bonington"], correct: 1 },
  { question: "What is the K2 challenge known for?", choices: ["Highest peak", "Most technical and deadly climb", "Fastest ascent", "Most traversed"], correct: 1 },
  { question: "What is the highest peak in Africa?", choices: ["Mount Kenya", "Mount Kilimanjaro", "Rwenzori", "Mount Elgon"], correct: 1 },
  { question: "What causes mountain formation (most common)?", choices: ["Volcanic activity", "Tectonic plate collision", "Erosion of plateaus", "Meteor impacts"], correct: 1 },
  { question: "What is the treeline?", choices: ["Highest road on a mountain", "Altitude above which trees cannot grow", "Snow line", "Base camp elevation"], correct: 1 },
  { question: "Which mountain range is called the 'Roof of the World'?", choices: ["Alps", "Andes", "Tibetan Plateau/Himalayas", "Rocky Mountains"], correct: 2 },
  { question: "What is the highest peak in Australia?", choices: ["Mount Kosciuszko", "Mount Bogong", "Blue Mountain Peak", "Mount Feathertop"], correct: 0 },
  { question: "Which mountain has the most prominent geographic isolation?", choices: ["Everest", "Kilimanjaro", "Mount Rainier", "Denali"], correct: 1 },
  { question: "What is the Death Zone in mountaineering?", choices: ["Avalanche risk zone", "Above 8,000 m where oxygen is insufficient for life", "Summit area", "Crevasse zone"], correct: 1 },
  { question: "Which mountain is the highest volcano?", choices: ["Etna", "Kilimanjaro", "Ojos del Salado", "Mauna Loa"], correct: 2 },
  { question: "What percentage of the world's freshwater is stored in mountain glaciers?", choices: ["5%", "15%", "26%", "50%"], correct: 2 },
  { question: "What is the highest peak in Europe (excluding Caucasus)?", choices: ["Mont Blanc", "Matterhorn", "Monte Rosa", "Dufourspitze"], correct: 0 },
  { question: "Which is the highest unclimbed mountain?", choices: ["Gangkhar Puensum", "Muchu Chhish", "Karjiang", "Labuche Kang"], correct: 0 },
  { question: "What is the Seven Summits?", choices: ["Seven tallest mountains", "Highest peak on each continent", "Mountains over 8000m", "Classic Himalayan peaks"], correct: 1 },
  { question: "What are the 8,000-metre peaks called collectively?", choices: ["Death peaks", "Eight-thousanders", "Himalayan giants", "Crown peaks"], correct: 1 },
  { question: "How many 8,000m peaks exist?", choices: ["10", "12", "14", "16"], correct: 2 },
  { question: "Which mountain range divides Europe and Asia?", choices: ["Carpathians", "Caucasus", "Urals", "Alps"], correct: 2 },
  { question: "What is Mauna Kea's significance for astronomy?", choices: ["Tallest from sea level", "High altitude with clear skies and low humidity", "Closest to equator", "Least light pollution globally"], correct: 1 },
  { question: "What is the highest mountain in Japan?", choices: ["Mount Fuji", "Mount Kita", "Mount Hotaka", "Mount Yari"], correct: 0 },
  { question: "Which country has the most mountains over 7,000 m?", choices: ["China", "Nepal", "Pakistan", "India"], correct: 2 },
  { question: "What is the Matterhorn famous for?", choices: ["Highest Swiss peak", "Pyramidal horn shape", "First alpine summit", "Hardest climb in Alps"], correct: 1 },
  { question: "What weather phenomenon is common on high peaks?", choices: ["Permanent fog", "Jet stream winds and severe storms", "Constant sunshine", "Predictable weather"], correct: 1 },
  { question: "What type of rock forms most high mountain peaks?", choices: ["Sandstone", "Limestone and granite", "Basalt", "Shale"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
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
    case "submit": { if (state.submitted || state.selected === null) return state; const q = state.questions[state.currentIndex]!; const ok = state.selected === q.correct; return { ...state, submitted: true, score: state.score + (ok ? 100 + Math.floor(state.timeLeft * 10) : 0), correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" }; }
    case "tick": { if (state.submitted) return state; const t = state.timeLeft - 1; if (t <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" }; return { ...state, timeLeft: t }; }
    case "next": { const n = state.currentIndex + 1; if (n >= state.questions.length) return { ...state, phase: "done" }; return { ...state, currentIndex: n, selected: null, submitted: false, timeLeft: 15, phase: "playing" }; }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
