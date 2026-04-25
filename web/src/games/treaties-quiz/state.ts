import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TreatiesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TreatiesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface TreatiesQuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Treaty of Versailles ended which war?", choices: ["Napoleonic Wars", "World War I", "World War II", "Crimean War"], correct: 1 },
  { question: "The Treaty of Westphalia (1648) is considered foundational to?", choices: ["International trade law", "The modern nation-state system", "The Roman Empire", "The League of Nations"], correct: 1 },
  { question: "The Camp David Accords (1978) involved which two countries?", choices: ["Israel and Jordan", "Egypt and Israel", "Israel and Syria", "Egypt and Libya"], correct: 1 },
  { question: "The Treaty of Tordesillas (1494) divided the world between?", choices: ["Spain and France", "Portugal and Spain", "England and Spain", "Portugal and England"], correct: 1 },
  { question: "The Paris Agreement (2015) focuses on?", choices: ["Nuclear arms reduction", "Climate change mitigation", "Trade liberalization", "Maritime boundaries"], correct: 1 },
  { question: "The SALT I treaty was between the USA and?", choices: ["China", "USSR", "Germany", "UK"], correct: 1 },
  { question: "The Treaty of Utrecht (1713) ended which conflict?", choices: ["Thirty Years War", "Seven Years War", "War of Spanish Succession", "Nine Years War"], correct: 2 },
  { question: "The Maastricht Treaty (1992) created which entity?", choices: ["NATO", "The European Union", "The United Nations", "The World Trade Organization"], correct: 1 },
  { question: "The Nuclear Non-Proliferation Treaty aims to?", choices: ["Ban all nuclear weapons", "Prevent the spread of nuclear weapons", "Regulate nuclear energy", "Disarm existing nuclear states"], correct: 1 },
  { question: "The Treaty of Ghent (1814) ended which war?", choices: ["War of Independence", "War of 1812", "Mexican-American War", "Civil War"], correct: 1 },
  { question: "The Oslo Accords were between Israel and?", choices: ["Hamas", "PLO (Palestine Liberation Organization)", "Syria", "Jordan"], correct: 1 },
  { question: "The Treaty of Paris (1783) recognized the independence of?", choices: ["Canada", "USA", "Mexico", "Haiti"], correct: 1 },
  { question: "The Kyoto Protocol (1997) was an international agreement on?", choices: ["Trade quotas", "Greenhouse gas emissions", "Nuclear testing", "Maritime law"], correct: 1 },
  { question: "The Sykes-Picot Agreement (1916) divided which region?", choices: ["Sub-Saharan Africa", "The Middle East", "Southeast Asia", "Central Asia"], correct: 1 },
  { question: "The Antarctic Treaty (1959) establishes Antarctica as?", choices: ["An international scientific reserve", "A shared military zone", "A resource-sharing area", "A neutral observation point"], correct: 0 },
  { question: "The Treaty of Nanjing (1842) forced China to cede which territory to Britain?", choices: ["Taiwan", "Hong Kong Island", "Macau", "Shanghai"], correct: 1 },
  { question: "The Good Friday Agreement (1998) brought peace to?", choices: ["Israel-Palestine", "Northern Ireland", "Bosnia", "South Africa"], correct: 1 },
  { question: "The Dayton Agreement (1995) ended the war in?", choices: ["Croatia", "Kosovo", "Bosnia and Herzegovina", "Serbia"], correct: 2 },
  { question: "The Chemical Weapons Convention bans?", choices: ["Nuclear weapons", "Biological weapons", "Chemical weapons", "Cluster munitions"], correct: 2 },
  { question: "The Treaty of Brest-Litovsk (1918) ended WWI fighting between Germany and?", choices: ["France", "Russia", "Ottoman Empire", "Bulgaria"], correct: 1 },
  { question: "The NAFTA trade agreement involved USA, Canada and?", choices: ["Brazil", "Mexico", "Argentina", "Chile"], correct: 1 },
  { question: "The START treaties (START I, II, New START) concern?", choices: ["Climate change", "Strategic nuclear arms reduction", "Conventional weapons", "Space treaties"], correct: 1 },
  { question: "The UN Charter was signed in which year?", choices: ["1944", "1945", "1946", "1947"], correct: 1 },
  { question: "The Treaty of Rome (1957) established?", choices: ["NATO", "The European Economic Community", "The United Nations", "The World Bank"], correct: 1 },
  { question: "The Outer Space Treaty (1967) prohibits placing which weapons in space?", choices: ["Conventional weapons", "Nuclear and weapons of mass destruction", "Surveillance satellites", "All weapons"], correct: 1 },
  { question: "The Treaty of Lisbon (2007) reformed?", choices: ["NATO", "The European Union", "The Council of Europe", "The G7"], correct: 1 },
  { question: "The Rush-Bagot Agreement (1817) demilitarized which border?", choices: ["US-Mexico border", "US-Canada (Great Lakes)", "Canada-Russia", "US-UK North Atlantic"], correct: 1 },
  { question: "The Treaty of Portsmouth (1905) ended which war?", choices: ["Sino-Japanese War", "Russo-Japanese War", "Boxer Rebellion", "First Sino-Japanese War"], correct: 1 },
  { question: "The Intermediate-Range Nuclear Forces (INF) Treaty was signed between the USA and USSR in?", choices: ["1979", "1983", "1987", "1991"], correct: 2 },
  { question: "The Trans-Pacific Partnership (TPP) was primarily focused on?", choices: ["Climate change", "Trade liberalization in Asia-Pacific", "Military alliances", "Space exploration"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: TreatiesQuizSettings): TreatiesQuizState {
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

export function reducer(state: TreatiesQuizState, action: TreatiesQuizAction): TreatiesQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const points = isCorrect ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      return newTime <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      return nextIndex >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: TreatiesQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
