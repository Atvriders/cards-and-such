import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CardMagicQuizSettings { questions: "10" | "20"; }
export interface CardMagicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CardMagicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "A 'force' in card magic means making a spectator?",
    "choices": [
      "shuffle freely",
      "pick a chosen card",
      "cut the deck",
      "memorize"
    ],
    "correct": 1
  },
  {
    "question": "The classic pass is used to?",
    "choices": [
      "reveal a card",
      "secretly cut the deck",
      "fan cards",
      "palm a card"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'The Expert at the Card Table' in 1902?",
    "choices": [
      "Dai Vernon",
      "S.W. Erdnase",
      "Ed Marlo",
      "Harry Houdini"
    ],
    "correct": 1
  },
  {
    "question": "A 'double lift' shows two cards as?",
    "choices": [
      "two",
      "one",
      "three",
      "none"
    ],
    "correct": 1
  },
  {
    "question": "Dai Vernon was nicknamed?",
    "choices": [
      "The Card Wizard",
      "The Professor",
      "The Master",
      "The King"
    ],
    "correct": 1
  },
  {
    "question": "'Out of This World' was created by?",
    "choices": [
      "Paul Curry",
      "Ed Marlo",
      "Bill Malone",
      "Juan Tamariz"
    ],
    "correct": 0
  },
  {
    "question": "A 'gaffed' card is?",
    "choices": [
      "normal",
      "specially prepared",
      "marked",
      "short"
    ],
    "correct": 1
  },
  {
    "question": "The Charlier cut is a one-handed?",
    "choices": [
      "false shuffle",
      "cut",
      "palm",
      "fan"
    ],
    "correct": 1
  },
  {
    "question": "Cardistry differs from magic by emphasizing?",
    "choices": [
      "secrets",
      "flourish and visuals",
      "forces",
      "gimmicks"
    ],
    "correct": 1
  },
  {
    "question": "'Triumph' is a classic effect by?",
    "choices": [
      "Vernon",
      "Marlo",
      "Tamariz",
      "Slydini"
    ],
    "correct": 0
  },
  {
    "question": "A 'key card' helps the magician to?",
    "choices": [
      "force",
      "locate the chosen card",
      "palm",
      "spread"
    ],
    "correct": 1
  },
  {
    "question": "The Zarrow shuffle is a?",
    "choices": [
      "false riffle shuffle",
      "cut",
      "palm",
      "spread"
    ],
    "correct": 0
  },
  {
    "question": "'Ambitious Card' routine features a card that?",
    "choices": [
      "disappears",
      "rises to the top",
      "changes",
      "duplicates"
    ],
    "correct": 1
  },
  {
    "question": "Juan Tamariz hails from?",
    "choices": [
      "Spain",
      "Italy",
      "Argentina",
      "Mexico"
    ],
    "correct": 0
  },
  {
    "question": "A 'pinky break' is?",
    "choices": [
      "a flourish",
      "a small finger gap",
      "a cut",
      "a force"
    ],
    "correct": 1
  },
  {
    "question": "The faro shuffle perfectly interleaves?",
    "choices": [
      "random cards",
      "every other card",
      "top half",
      "bottom half"
    ],
    "correct": 1
  },
  {
    "question": "Eight perfect out-faros restore a 52-card deck to?",
    "choices": [
      "random",
      "its original order",
      "reverse",
      "shuffled"
    ],
    "correct": 1
  },
  {
    "question": "A 'stripper deck' has cards that are slightly?",
    "choices": [
      "shorter",
      "tapered",
      "marked",
      "bent"
    ],
    "correct": 1
  },
  {
    "question": "The classic palm hides a card in the?",
    "choices": [
      "sleeve",
      "palm of hand",
      "pocket",
      "finger"
    ],
    "correct": 1
  },
  {
    "question": "'Mnemonica' is a stack created by?",
    "choices": [
      "Tamariz",
      "Aronson",
      "Mullica",
      "Goshman"
    ],
    "correct": 0
  },
  {
    "question": "A 'crimp' is a slight bend used as a?",
    "choices": [
      "flourish",
      "key locator",
      "force",
      "cut"
    ],
    "correct": 1
  },
  {
    "question": "Ed Marlo specialized in?",
    "choices": [
      "coin magic",
      "card magic",
      "mentalism",
      "stage"
    ],
    "correct": 1
  },
  {
    "question": "The 'Elmsley count' displays four cards as?",
    "choices": [
      "four",
      "four hiding one",
      "three",
      "two"
    ],
    "correct": 1
  },
  {
    "question": "Cardistry's modern boom started in the?",
    "choices": [
      "1990s",
      "2000s",
      "1980s",
      "1970s"
    ],
    "correct": 1
  },
  {
    "question": "A 'glide' secretly deals from the?",
    "choices": [
      "top",
      "bottom",
      "middle",
      "second"
    ],
    "correct": 1
  },
  {
    "question": "The 'second deal' deals from the?",
    "choices": [
      "top",
      "second from top",
      "bottom",
      "middle"
    ],
    "correct": 1
  },
  {
    "question": "'Any Card at Any Number' is abbreviated?",
    "choices": [
      "ACAAN",
      "AAAA",
      "ACAN",
      "AC@N"
    ],
    "correct": 0
  },
  {
    "question": "Penn and Teller's TV show is called?",
    "choices": [
      "Magic Hour",
      "Fool Us",
      "The Trick",
      "Illusionists"
    ],
    "correct": 1
  },
  {
    "question": "A bridge-size card is narrower than?",
    "choices": [
      "jumbo",
      "poker-size",
      "tarot",
      "mini"
    ],
    "correct": 1
  },
  {
    "question": "Bicycle playing cards are made by?",
    "choices": [
      "USPCC",
      "Cartamundi",
      "Theory11",
      "Ellusionist"
    ],
    "correct": 0
  },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CardMagicQuizSettings): CardMagicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CardMagicQuizState, action: CardMagicQuizAction): CardMagicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CardMagicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
