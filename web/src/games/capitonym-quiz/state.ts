import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CapitonymQuizSettings { questions: "8" | "10" | "12"; }
export interface CapitonymQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CapitonymQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "A capitonym is a word whose meaning changes based on:",
    "choices": [
      "capitalization",
      "pronunciation",
      "tense",
      "spelling"
    ],
    "correct": 0
  },
  {
    "question": "'Polish' (verb, to shine) vs 'Polish' (from Poland) is an example of a:",
    "choices": [
      "capitonym",
      "homophone",
      "synonym",
      "antonym"
    ],
    "correct": 0
  },
  {
    "question": "'March' (month) vs 'march' (to walk) — what type of word pair?",
    "choices": [
      "capitonym",
      "homophone",
      "anagram",
      "antonym"
    ],
    "correct": 0
  },
  {
    "question": "'Turkey' (country) vs 'turkey' (bird) — these are:",
    "choices": [
      "capitonyms",
      "synonyms",
      "homographs only",
      "antonyms"
    ],
    "correct": 0
  },
  {
    "question": "Which of these is a true capitonym?",
    "choices": [
      "May/may",
      "their/there",
      "bear/bare",
      "to/too"
    ],
    "correct": 0
  },
  {
    "question": "'Mercury' (planet) vs 'mercury' (metal) — capitonym?",
    "choices": [
      "yes",
      "no",
      "only homophone",
      "only antonym"
    ],
    "correct": 0
  },
  {
    "question": "'Nice' (French city) vs 'nice' (kind) — what makes them differ in writing?",
    "choices": [
      "capitalization",
      "spelling",
      "punctuation",
      "hyphenation"
    ],
    "correct": 0
  },
  {
    "question": "'Job' (Bible book) vs 'job' (work) — the change of meaning is signaled by:",
    "choices": [
      "initial capital letter",
      "syllable count",
      "stress",
      "vowel"
    ],
    "correct": 0
  },
  {
    "question": "'Earth' (the planet) vs 'earth' (soil) is best classified as a:",
    "choices": [
      "capitonym",
      "rhyme",
      "compound",
      "diminutive"
    ],
    "correct": 0
  },
  {
    "question": "'China' (country) vs 'china' (porcelain) demonstrates:",
    "choices": [
      "capitonym",
      "metaphor only",
      "antonym",
      "loanword"
    ],
    "correct": 0
  },
  {
    "question": "Capitonyms typically have the same:",
    "choices": [
      "spelling",
      "meaning",
      "etymology only",
      "pronunciation always"
    ],
    "correct": 0
  },
  {
    "question": "'August' (month) vs 'august' (majestic) — the meanings differ when:",
    "choices": [
      "the first letter is capitalized",
      "they rhyme",
      "they are abbreviated",
      "they are pluralized"
    ],
    "correct": 0
  },
  {
    "question": "'Reading' (a town in England) vs 'reading' (gerund of read) is a:",
    "choices": [
      "capitonym",
      "synonym",
      "metaphor",
      "antonym"
    ],
    "correct": 0
  },
  {
    "question": "'Cancer' (zodiac sign) vs 'cancer' (disease) — capitonym?",
    "choices": [
      "yes",
      "no",
      "homophone only",
      "antonym"
    ],
    "correct": 0
  },
  {
    "question": "'Mobile' (Alabama city) vs 'mobile' (movable) — the words are:",
    "choices": [
      "capitonyms",
      "synonyms",
      "antonyms",
      "compounds"
    ],
    "correct": 0
  },
  {
    "question": "Which pair is NOT a capitonym?",
    "choices": [
      "dog/cat",
      "Polish/polish",
      "Turkey/turkey",
      "May/may"
    ],
    "correct": 0
  },
  {
    "question": "'Jordan' (country) vs 'jordan' as a common noun is rare; capitonyms often involve:",
    "choices": [
      "proper nouns vs common nouns",
      "verbs vs adverbs",
      "prepositions",
      "interjections"
    ],
    "correct": 0
  },
  {
    "question": "In 'I want to march in March', 'march' and 'March' are:",
    "choices": [
      "capitonyms",
      "synonyms",
      "rhymes only",
      "antonyms"
    ],
    "correct": 0
  },
  {
    "question": "'Bill' (proper name) vs 'bill' (invoice) is a capitonym only if:",
    "choices": [
      "capitalization changes meaning",
      "pronunciation differs",
      "the spelling changes",
      "hyphenated"
    ],
    "correct": 0
  },
  {
    "question": "Capitonyms are a special kind of:",
    "choices": [
      "homograph",
      "homophone",
      "synonym",
      "antonym"
    ],
    "correct": 0
  },
  {
    "question": "'Lent' (Christian season) vs 'lent' (past tense of lend) — capitonym?",
    "choices": [
      "yes",
      "no",
      "only homophone",
      "only synonym"
    ],
    "correct": 0
  },
  {
    "question": "'Pole' (from Poland) vs 'pole' (long stick) is a:",
    "choices": [
      "capitonym",
      "homophone only",
      "antonym",
      "rhyme only"
    ],
    "correct": 0
  },
  {
    "question": "Which best defines a capitonym?",
    "choices": [
      "same spelling, different meaning by capitalization",
      "different spellings, same sound",
      "same sound, different meaning",
      "opposite meanings"
    ],
    "correct": 0
  },
  {
    "question": "'Frank' (a person's name) vs 'frank' (honest) is a:",
    "choices": [
      "capitonym",
      "synonym",
      "antonym",
      "compound word"
    ],
    "correct": 0
  },
  {
    "question": "'Sunday' (day of week) — is 'sunday' (lowercase) a capitonym pair?",
    "choices": [
      "no, both refer to the day",
      "yes always",
      "only as homophones",
      "only as antonyms"
    ],
    "correct": 0
  },
  {
    "question": "'Welsh' (from Wales) vs 'welsh' (to default on a debt) — capitonym?",
    "choices": [
      "yes",
      "no",
      "only homophone",
      "only antonym"
    ],
    "correct": 0
  },
  {
    "question": "'Roman' (from Rome) vs 'roman' (a font style) shows that capitonyms:",
    "choices": [
      "span proper nouns and common nouns",
      "are always animals",
      "must be verbs",
      "must rhyme"
    ],
    "correct": 0
  },
  {
    "question": "'Scotch' (Scottish) vs 'scotch' (to put an end to) — capitonym?",
    "choices": [
      "yes",
      "no",
      "only synonym",
      "only antonym"
    ],
    "correct": 0
  },
  {
    "question": "'Apple' (company) vs 'apple' (fruit) — by strict definition, this is a:",
    "choices": [
      "capitonym",
      "synonym",
      "antonym",
      "compound"
    ],
    "correct": 0
  },
  {
    "question": "Which feature does NOT change in a capitonym pair?",
    "choices": [
      "the letters used",
      "the meaning",
      "the capitalization",
      "the part of speech sometimes"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CapitonymQuizSettings): CapitonymQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CapitonymQuizState, action: CapitonymQuizAction): CapitonymQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CapitonymQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
