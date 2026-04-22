import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CryptogramSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface CryptogramState {
  /** The original plaintext */
  plaintext: string;
  /** The ciphertext (encrypted) */
  ciphertext: string;
  /** encryptMap[plainLetter] = cipherLetter */
  encryptMap: Record<string, string>;
  /** decryptMap[cipherLetter] = playerGuess */
  decryptMap: Record<string, string>;
  /** Revealed letters: cipherLetter -> plainLetter (via hints) */
  revealed: Record<string, string>;
  /** Selected cipher letter for input */
  selectedCipher: string | null;
  won: boolean;
  guesses: number;
  hintsUsed: number;
  score: number;
  rngSeed: number;
  settings: CryptogramSettings;
}

export type CryptogramAction =
  | { type: "selectCipher"; letter: string }
  | { type: "guessLetter"; plainLetter: string }
  | { type: "clearGuess" }
  | { type: "hint" };

const QUOTES = [
  "To be or not to be that is the question",
  "The only way to do great work is to love what you do",
  "In the middle of every difficulty lies opportunity",
  "Life is what happens when you are busy making other plans",
  "The future belongs to those who believe in the beauty of their dreams",
  "It does not matter how slowly you go as long as you do not stop",
  "Everything you can imagine is real",
  "The journey of a thousand miles begins with one step",
  "That which does not kill us makes us stronger",
  "Do what you can with all you have wherever you are",
  "Spread love everywhere you go and let no one come to you without feeling happier",
  "When you reach the end of your rope tie a knot in it and hang on",
  "Always remember that you are absolutely unique just like everyone else",
  "Do not go where the path may lead go instead where there is no path and leave a trail",
  "You will face many defeats in life but never let yourself be defeated",
  "The greatest glory in living lies not in never falling but in rising every time we fall",
  "In the end it is not the years in your life that count but the life in your years",
  "Never let the fear of striking out keep you from playing the game",
  "Life is either a daring adventure or nothing at all",
  "Many of life's failures are people who did not realize how close they were to success when they gave up",
  "You have brains in your head and feet in your shoes you can steer yourself any direction you choose",
  "If life were predictable it would cease to be life and be without flavor",
  "If you look at what you have in life you will always have more",
  "If you set your goals ridiculously high and it is a failure you will fail above everyone else's success",
  "Spread kindness wherever you go and create a wave of warmth and joy",
  "The only impossible journey is the one you never begin",
  "In this bright future you cannot forget your past",
  "It is during our darkest moments that we must focus to see the light",
  "Do not judge each day by the harvest you reap but by the seeds that you plant",
  "The purpose of our lives is to be happy",
];

function createCipher(rng: () => number): Record<string, string> {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const shuffled = [...alpha];
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const map: Record<string, string> = {};
  for (let i = 0; i < alpha.length; i++) {
    map[alpha[i]!] = shuffled[i]!;
  }
  // Ensure no letter maps to itself
  for (let i = 0; i < alpha.length; i++) {
    if (map[alpha[i]!] === alpha[i]) {
      // swap with next
      const j = (i + 1) % alpha.length;
      const tmp = map[alpha[j]!]!;
      map[alpha[j]!] = map[alpha[i]!]!;
      map[alpha[i]!] = tmp;
    }
  }
  return map;
}

function encrypt(plaintext: string, map: Record<string, string>): string {
  return plaintext
    .toUpperCase()
    .split("")
    .map((ch) => (map[ch] ?? ch))
    .join("");
}

/** Returns how many pre-revealed letters difficulty allows */
function revealCount(difficulty: string): number {
  if (difficulty === "easy") return 3;
  if (difficulty === "medium") return 1;
  return 0;
}

export function initialState(seed: number, settings: CryptogramSettings): CryptogramState {
  const rng = mulberry32(seed);
  const quoteIdx = Math.floor(rng() * QUOTES.length);
  const plaintext = QUOTES[quoteIdx]!.toUpperCase();
  const encryptMap = createCipher(rng);
  const ciphertext = encrypt(plaintext, encryptMap);

  // Build reverse map for hints: cipherLetter -> plainLetter
  const decryptMap: Record<string, string> = {};
  const revealed: Record<string, string> = {};

  // Pre-reveal letters based on difficulty
  const count = revealCount(settings.difficulty);
  if (count > 0) {
    // Find unique cipher letters
    const cipherLetters = [...new Set(ciphertext.split("").filter((c) => /[A-Z]/.test(c)))];
    // Shuffle for random reveals
    for (let i = cipherLetters.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [cipherLetters[i], cipherLetters[j]] = [cipherLetters[j]!, cipherLetters[i]!];
    }
    // Find plain letter for each cipher letter
    const invMap: Record<string, string> = {};
    for (const [plain, cipher] of Object.entries(encryptMap)) {
      invMap[cipher] = plain;
    }
    for (let i = 0; i < Math.min(count, cipherLetters.length); i++) {
      const cl = cipherLetters[i]!;
      const pl = invMap[cl]!;
      revealed[cl] = pl;
      decryptMap[cl] = pl;
    }
  }

  return {
    plaintext,
    ciphertext,
    encryptMap,
    decryptMap,
    revealed,
    selectedCipher: null,
    won: false,
    guesses: 0,
    hintsUsed: 0,
    score: 0,
    rngSeed: seed,
    settings,
  };
}

function checkWin(plaintext: string, ciphertext: string, decryptMap: Record<string, string>): boolean {
  for (let i = 0; i < ciphertext.length; i++) {
    const ch = ciphertext[i]!;
    if (!/[A-Z]/.test(ch)) continue;
    if (decryptMap[ch] !== plaintext[i]) return false;
  }
  return true;
}

export function reducer(state: CryptogramState, action: CryptogramAction): CryptogramState {
  if (state.won) return state;

  if (action.type === "selectCipher") {
    const { letter } = action;
    if (!/^[A-Z]$/.test(letter)) return state;
    if (state.revealed[letter]) return state; // already revealed, can't change
    return { ...state, selectedCipher: letter };
  }

  if (action.type === "guessLetter") {
    const { selectedCipher, decryptMap, plaintext, ciphertext } = state;
    if (!selectedCipher) return state;
    const { plainLetter } = action;
    if (!/^[A-Z]$/.test(plainLetter)) return state;
    const next = { ...decryptMap, [selectedCipher]: plainLetter };
    const won = checkWin(plaintext, ciphertext, next);
    const score = won ? Math.max(100, 1000 - (state.guesses + 1) * 20 - state.hintsUsed * 100) : 0;
    return {
      ...state,
      decryptMap: next,
      guesses: state.guesses + 1,
      selectedCipher: null,
      won,
      score,
    };
  }

  if (action.type === "clearGuess") {
    const { selectedCipher, decryptMap, revealed } = state;
    if (!selectedCipher) return state;
    if (revealed[selectedCipher]) return state;
    const next = { ...decryptMap };
    delete next[selectedCipher];
    return { ...state, decryptMap: next, selectedCipher: null };
  }

  if (action.type === "hint") {
    // Find cipher letters that haven't been revealed yet
    const invMap: Record<string, string> = {};
    for (const [plain, cipher] of Object.entries(state.encryptMap)) {
      invMap[cipher] = plain;
    }
    const cipherLetters = [...new Set(state.ciphertext.split("").filter((c) => /[A-Z]/.test(c)))];
    const unrevealed = cipherLetters.filter((cl) => !state.revealed[cl]);
    if (unrevealed.length === 0) return state;
    // Reveal the first unrevealed
    const cl = unrevealed[0]!;
    const pl = invMap[cl]!;
    const revealed = { ...state.revealed, [cl]: pl };
    const decryptMap = { ...state.decryptMap, [cl]: pl };
    const won = checkWin(state.plaintext, state.ciphertext, decryptMap);
    const score = won ? Math.max(100, 1000 - state.guesses * 20 - (state.hintsUsed + 1) * 100) : 0;
    return {
      ...state,
      revealed,
      decryptMap,
      hintsUsed: state.hintsUsed + 1,
      won,
      score,
    };
  }

  return state;
}

export function isTerminal(state: CryptogramState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
