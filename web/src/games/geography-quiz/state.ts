import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GeographyQuizSettings {
  difficulty: "easy" | "medium" | "hard";
  rounds: "10" | "20" | "30";
}

export interface GeoQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface GeographyQuizState {
  settings: GeographyQuizSettings;
  questions: GeoQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type GeographyQuizAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

// [Country, Capital, difficulty: 0=easy, 1=medium, 2=hard]
const COUNTRY_CAPITALS: Array<[string, string, number]> = [
  ["France", "Paris", 0],
  ["Germany", "Berlin", 0],
  ["Japan", "Tokyo", 0],
  ["United States", "Washington D.C.", 0],
  ["United Kingdom", "London", 0],
  ["China", "Beijing", 0],
  ["Australia", "Canberra", 0],
  ["Canada", "Ottawa", 0],
  ["Brazil", "Brasília", 0],
  ["Russia", "Moscow", 0],
  ["Italy", "Rome", 0],
  ["Spain", "Madrid", 0],
  ["India", "New Delhi", 0],
  ["Mexico", "Mexico City", 0],
  ["South Korea", "Seoul", 0],
  ["Argentina", "Buenos Aires", 0],
  ["Egypt", "Cairo", 0],
  ["South Africa", "Pretoria", 0],
  ["Saudi Arabia", "Riyadh", 0],
  ["Turkey", "Ankara", 0],
  ["Netherlands", "Amsterdam", 1],
  ["Sweden", "Stockholm", 1],
  ["Norway", "Oslo", 1],
  ["Denmark", "Copenhagen", 1],
  ["Finland", "Helsinki", 1],
  ["Poland", "Warsaw", 1],
  ["Austria", "Vienna", 1],
  ["Switzerland", "Bern", 1],
  ["Portugal", "Lisbon", 1],
  ["Greece", "Athens", 1],
  ["Czech Republic", "Prague", 1],
  ["Hungary", "Budapest", 1],
  ["Romania", "Bucharest", 1],
  ["Ukraine", "Kyiv", 1],
  ["Thailand", "Bangkok", 1],
  ["Vietnam", "Hanoi", 1],
  ["Philippines", "Manila", 1],
  ["Indonesia", "Jakarta", 1],
  ["Malaysia", "Kuala Lumpur", 1],
  ["Pakistan", "Islamabad", 1],
  ["Bangladesh", "Dhaka", 1],
  ["Nigeria", "Abuja", 1],
  ["Kenya", "Nairobi", 1],
  ["Ghana", "Accra", 1],
  ["Ethiopia", "Addis Ababa", 1],
  ["Morocco", "Rabat", 1],
  ["Algeria", "Algiers", 1],
  ["Peru", "Lima", 1],
  ["Colombia", "Bogotá", 1],
  ["Chile", "Santiago", 1],
  ["New Zealand", "Wellington", 1],
  ["Venezuela", "Caracas", 1],
  ["Cuba", "Havana", 1],
  ["Iran", "Tehran", 1],
  ["Iraq", "Baghdad", 1],
  ["Israel", "Jerusalem", 1],
  ["Afghanistan", "Kabul", 2],
  ["Albania", "Tirana", 2],
  ["Angola", "Luanda", 2],
  ["Armenia", "Yerevan", 2],
  ["Azerbaijan", "Baku", 2],
  ["Bahrain", "Manama", 2],
  ["Belarus", "Minsk", 2],
  ["Bolivia", "Sucre", 2],
  ["Bosnia", "Sarajevo", 2],
  ["Botswana", "Gaborone", 2],
  ["Brunei", "Bandar Seri Begawan", 2],
  ["Bulgaria", "Sofia", 2],
  ["Burkina Faso", "Ouagadougou", 2],
  ["Cambodia", "Phnom Penh", 2],
  ["Cameroon", "Yaoundé", 2],
  ["Congo", "Brazzaville", 2],
  ["Croatia", "Zagreb", 2],
  ["Cyprus", "Nicosia", 2],
  ["Ecuador", "Quito", 2],
  ["El Salvador", "San Salvador", 2],
  ["Estonia", "Tallinn", 2],
  ["Fiji", "Suva", 2],
  ["Gabon", "Libreville", 2],
  ["Georgia", "Tbilisi", 2],
  ["Guatemala", "Guatemala City", 2],
  ["Guinea", "Conakry", 2],
  ["Haiti", "Port-au-Prince", 2],
  ["Honduras", "Tegucigalpa", 2],
  ["Iceland", "Reykjavik", 2],
  ["Jordan", "Amman", 2],
  ["Kazakhstan", "Astana", 2],
  ["Kosovo", "Pristina", 2],
  ["Kuwait", "Kuwait City", 2],
  ["Kyrgyzstan", "Bishkek", 2],
  ["Laos", "Vientiane", 2],
  ["Latvia", "Riga", 2],
  ["Lebanon", "Beirut", 2],
  ["Liberia", "Monrovia", 2],
  ["Libya", "Tripoli", 2],
  ["Lithuania", "Vilnius", 2],
  ["Luxembourg", "Luxembourg City", 2],
  ["Madagascar", "Antananarivo", 2],
  ["Malawi", "Lilongwe", 2],
  ["Maldives", "Malé", 2],
  ["Mali", "Bamako", 2],
  ["Malta", "Valletta", 2],
  ["Mauritania", "Nouakchott", 2],
  ["Moldova", "Chișinău", 2],
  ["Mongolia", "Ulaanbaatar", 2],
  ["Montenegro", "Podgorica", 2],
  ["Mozambique", "Maputo", 2],
  ["Myanmar", "Naypyidaw", 2],
  ["Namibia", "Windhoek", 2],
  ["Nepal", "Kathmandu", 2],
  ["Nicaragua", "Managua", 2],
  ["Niger", "Niamey", 2],
  ["North Korea", "Pyongyang", 2],
  ["North Macedonia", "Skopje", 2],
  ["Oman", "Muscat", 2],
  ["Panama", "Panama City", 2],
  ["Papua New Guinea", "Port Moresby", 2],
  ["Paraguay", "Asunción", 2],
  ["Qatar", "Doha", 2],
  ["Serbia", "Belgrade", 2],
  ["Sierra Leone", "Freetown", 2],
  ["Singapore", "Singapore", 2],
  ["Slovakia", "Bratislava", 2],
  ["Slovenia", "Ljubljana", 2],
  ["Somalia", "Mogadishu", 2],
  ["Sri Lanka", "Sri Jayawardenepura Kotte", 2],
  ["Sudan", "Khartoum", 2],
  ["Syria", "Damascus", 2],
  ["Taiwan", "Taipei", 2],
  ["Tajikistan", "Dushanbe", 2],
  ["Tanzania", "Dodoma", 2],
  ["Timor-Leste", "Dili", 2],
  ["Togo", "Lomé", 2],
  ["Tunisia", "Tunis", 2],
  ["Turkmenistan", "Ashgabat", 2],
  ["Uganda", "Kampala", 2],
  ["United Arab Emirates", "Abu Dhabi", 2],
  ["Uruguay", "Montevideo", 2],
  ["Uzbekistan", "Tashkent", 2],
  ["Zambia", "Lusaka", 2],
  ["Zimbabwe", "Harare", 2],
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: GeographyQuizSettings): GeographyQuizState {
  const rng = mulberry32(seed);
  const diffLevel = settings.difficulty === "easy" ? 0 : settings.difficulty === "medium" ? 1 : 2;
  const count = parseInt(settings.rounds, 10);

  // Pool includes entries up to diffLevel
  const pool = COUNTRY_CAPITALS.filter(([, , d]) => d <= diffLevel);
  const shuffled = shuffle(pool, rng);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  const allCapitals = COUNTRY_CAPITALS.map(([, c]) => c);

  const questions: GeoQuestion[] = selected.map(([country, capital]) => {
    const wrongs = shuffle(allCapitals.filter(c => c !== capital), rng).slice(0, 3);
    const choices = shuffle([capital, ...wrongs], rng);
    return {
      question: `What is the capital of ${country}?`,
      choices,
      correctIndex: choices.indexOf(capital),
    };
  });

  return {
    settings,
    questions,
    currentIndex: 0,
    selected: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: GeographyQuizState, action: GeographyQuizAction): GeographyQuizState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "select":
      if (state.submitted) return state;
      return { ...state, selected: action.index };

    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const correct = state.selected === q.correctIndex;
      return {
        ...state,
        submitted: true,
        score: correct ? state.score + 10 : state.score,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
      };
    }

    case "next": {
      if (!state.submitted) return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GeographyQuizState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
