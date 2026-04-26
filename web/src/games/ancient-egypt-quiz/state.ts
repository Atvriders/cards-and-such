import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AncientEgyptQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface AncientEgyptQuizState { settings: AncientEgyptQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type AncientEgyptQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string; wrong: string[] }[] = [
  { question: "Who built the Great Pyramid at Giza?", answer: "Khufu", wrong: ["Khafre","Menkaure","Ramesses II"] },
  { question: "What was the Egyptian writing system called?", answer: "Hieroglyphics", wrong: ["Cuneiform","Linear B","Demotic"] },
  { question: "Which river was essential to Egyptian civilization?", answer: "Nile", wrong: ["Tigris","Euphrates","Jordan"] },
  { question: "What is the name of the famous sphinx near Giza?", answer: "Great Sphinx", wrong: ["Luxor Sphinx","Karnak Sphinx","Memphis Sphinx"] },
  { question: "Which pharaoh is known for the most statues and monuments?", answer: "Ramesses II", wrong: ["Akhenaten","Thutmose III","Seti I"] },
  { question: "What were Egyptian rulers called?", answer: "Pharaoh", wrong: ["Emperor","King","Sultan"] },
  { question: "Which goddess was associated with motherhood and magic?", answer: "Isis", wrong: ["Hathor","Sekhmet","Bastet"] },
  { question: "What is the name of the ancient Egyptian book of the dead?", answer: "Book of the Dead", wrong: ["Pyramid Texts","Coffin Texts","Papyrus of Ani"] },
  { question: "Which stone helped decode hieroglyphics?", answer: "Rosetta Stone", wrong: ["Behistun Stone","Stele of Hammurabi","Palermo Stone"] },
  { question: "What was the ancient Egyptian capital during the New Kingdom?", answer: "Thebes", wrong: ["Memphis","Amarna","Heliopolis"] },
  { question: "Which pharaoh introduced monotheism worshipping Aten?", answer: "Akhenaten", wrong: ["Tutankhamun","Amenhotep III","Ramesses II"] },
  { question: "What material did Egyptians use to write on?", answer: "Papyrus", wrong: ["Parchment","Clay tablet","Vellum"] },
  { question: "Who was the boy-king pharaoh discovered in 1922?", answer: "Tutankhamun", wrong: ["Ramesses II","Akhenaten","Thutmose IV"] },
  { question: "What organ was preserved in canopic jars?", answer: "Internal organs", wrong: ["Brain","Heart","Lungs only"] },
  { question: "What process preserved dead bodies in Egypt?", answer: "Mummification", wrong: ["Embalming","Cremation","Ossification"] },
  { question: "What was the Egyptian god of the dead?", answer: "Osiris", wrong: ["Anubis","Ra","Set"] },
  { question: "What structure were pharaohs buried in?", answer: "Pyramid", wrong: ["Temple","Mastaba","Tomb"] },
  { question: "Which queen co-ruled with Thutmose III as pharaoh?", answer: "Hatshepsut", wrong: ["Nefertiti","Cleopatra","Ankhesenamun"] },
  { question: "What was the Egyptian sun god called?", answer: "Ra", wrong: ["Horus","Amun","Thoth"] },
  { question: "What did the Nile's annual flooding leave behind?", answer: "Fertile silt", wrong: ["Salt deposits","Clay bricks","Gold dust"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: AncientEgyptQuizSettings): AncientEgyptQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const choices = shuffle([item.answer, ...item.wrong.slice(0, 3)], rng);
    return { question: item.question, answer: item.answer, choices };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: AncientEgyptQuizState, action: AncientEgyptQuizAction): AncientEgyptQuizState {
  if (state.done) return state;
  if (action.type === "select") {
    if (state.selected !== null) return state;
    const entry = state.entries[state.current]!;
    const correct = entry.choices[action.index] === entry.answer;
    return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score };
  }
  if (action.type === "next") {
    if (state.selected === null) return state;
    const next = state.current + 1;
    if (next >= state.entries.length) return { ...state, done: true };
    return { ...state, current: next, selected: null };
  }
  return state;
}

export function isTerminal(state: AncientEgyptQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
