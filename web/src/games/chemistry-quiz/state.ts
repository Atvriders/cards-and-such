import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ChemistryQuizSettings {
  mode: "name-to-symbol" | "symbol-to-name" | "mixed";
  rounds: "10" | "20" | "30";
}

export interface ChemQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface ChemistryQuizState {
  settings: ChemistryQuizSettings;
  questions: ChemQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "done";
}

export type ChemistryQuizAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

// All 118 elements: [number, symbol, name]
const ELEMENTS: Array<[number, string, string]> = [
  [1, "H", "Hydrogen"], [2, "He", "Helium"], [3, "Li", "Lithium"], [4, "Be", "Beryllium"],
  [5, "B", "Boron"], [6, "C", "Carbon"], [7, "N", "Nitrogen"], [8, "O", "Oxygen"],
  [9, "F", "Fluorine"], [10, "Ne", "Neon"], [11, "Na", "Sodium"], [12, "Mg", "Magnesium"],
  [13, "Al", "Aluminum"], [14, "Si", "Silicon"], [15, "P", "Phosphorus"], [16, "S", "Sulfur"],
  [17, "Cl", "Chlorine"], [18, "Ar", "Argon"], [19, "K", "Potassium"], [20, "Ca", "Calcium"],
  [21, "Sc", "Scandium"], [22, "Ti", "Titanium"], [23, "V", "Vanadium"], [24, "Cr", "Chromium"],
  [25, "Mn", "Manganese"], [26, "Fe", "Iron"], [27, "Co", "Cobalt"], [28, "Ni", "Nickel"],
  [29, "Cu", "Copper"], [30, "Zn", "Zinc"], [31, "Ga", "Gallium"], [32, "Ge", "Germanium"],
  [33, "As", "Arsenic"], [34, "Se", "Selenium"], [35, "Br", "Bromine"], [36, "Kr", "Krypton"],
  [37, "Rb", "Rubidium"], [38, "Sr", "Strontium"], [39, "Y", "Yttrium"], [40, "Zr", "Zirconium"],
  [41, "Nb", "Niobium"], [42, "Mo", "Molybdenum"], [43, "Tc", "Technetium"], [44, "Ru", "Ruthenium"],
  [45, "Rh", "Rhodium"], [46, "Pd", "Palladium"], [47, "Ag", "Silver"], [48, "Cd", "Cadmium"],
  [49, "In", "Indium"], [50, "Sn", "Tin"], [51, "Sb", "Antimony"], [52, "Te", "Tellurium"],
  [53, "I", "Iodine"], [54, "Xe", "Xenon"], [55, "Cs", "Cesium"], [56, "Ba", "Barium"],
  [57, "La", "Lanthanum"], [58, "Ce", "Cerium"], [59, "Pr", "Praseodymium"], [60, "Nd", "Neodymium"],
  [61, "Pm", "Promethium"], [62, "Sm", "Samarium"], [63, "Eu", "Europium"], [64, "Gd", "Gadolinium"],
  [65, "Tb", "Terbium"], [66, "Dy", "Dysprosium"], [67, "Ho", "Holmium"], [68, "Er", "Erbium"],
  [69, "Tm", "Thulium"], [70, "Yb", "Ytterbium"], [71, "Lu", "Lutetium"], [72, "Hf", "Hafnium"],
  [73, "Ta", "Tantalum"], [74, "W", "Tungsten"], [75, "Re", "Rhenium"], [76, "Os", "Osmium"],
  [77, "Ir", "Iridium"], [78, "Pt", "Platinum"], [79, "Au", "Gold"], [80, "Hg", "Mercury"],
  [81, "Tl", "Thallium"], [82, "Pb", "Lead"], [83, "Bi", "Bismuth"], [84, "Po", "Polonium"],
  [85, "At", "Astatine"], [86, "Rn", "Radon"], [87, "Fr", "Francium"], [88, "Ra", "Radium"],
  [89, "Ac", "Actinium"], [90, "Th", "Thorium"], [91, "Pa", "Protactinium"], [92, "U", "Uranium"],
  [93, "Np", "Neptunium"], [94, "Pu", "Plutonium"], [95, "Am", "Americium"], [96, "Cm", "Curium"],
  [97, "Bk", "Berkelium"], [98, "Cf", "Californium"], [99, "Es", "Einsteinium"], [100, "Fm", "Fermium"],
  [101, "Md", "Mendelevium"], [102, "No", "Nobelium"], [103, "Lr", "Lawrencium"], [104, "Rf", "Rutherfordium"],
  [105, "Db", "Dubnium"], [106, "Sg", "Seaborgium"], [107, "Bh", "Bohrium"], [108, "Hs", "Hassium"],
  [109, "Mt", "Meitnerium"], [110, "Ds", "Darmstadtium"], [111, "Rg", "Roentgenium"], [112, "Cn", "Copernicium"],
  [113, "Nh", "Nihonium"], [114, "Fl", "Flerovium"], [115, "Mc", "Moscovium"], [116, "Lv", "Livermorium"],
  [117, "Ts", "Tennessine"], [118, "Og", "Oganesson"],
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: ChemistryQuizSettings): ChemistryQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const shuffled = shuffle([...ELEMENTS], rng);
  const allSymbols = ELEMENTS.map(([, s]) => s);
  const allNames = ELEMENTS.map(([, , n]) => n);

  const questions: ChemQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const [, symbol, name] = shuffled[i % shuffled.length]!;
    const useNameToSymbol =
      settings.mode === "name-to-symbol" ? true :
      settings.mode === "symbol-to-name" ? false :
      rng() < 0.5;

    if (useNameToSymbol) {
      const wrongSymbols = shuffle(allSymbols.filter(s => s !== symbol), rng).slice(0, 3);
      const choices = shuffle([symbol, ...wrongSymbols], rng);
      questions.push({
        question: `What is the chemical symbol for ${name}?`,
        choices,
        correctIndex: choices.indexOf(symbol),
      });
    } else {
      const wrongNames = shuffle(allNames.filter(n => n !== name), rng).slice(0, 3);
      const choices = shuffle([name, ...wrongNames], rng);
      questions.push({
        question: `The symbol "${symbol}" belongs to which element?`,
        choices,
        correctIndex: choices.indexOf(name),
      });
    }
  }

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

export function reducer(state: ChemistryQuizState, action: ChemistryQuizAction): ChemistryQuizState {
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

export function isTerminal(state: ChemistryQuizState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
