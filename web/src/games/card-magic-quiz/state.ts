import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CardMagicQuizSettings { questions: "10" | "20"; }
export interface CardMagicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CardMagicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Card magic's 'pip' refers to?",
    "choices": [
      "face value symbols",
      "jokers",
      "corner index",
      "back design"
    ],
    "correct": 0
  },
  {
    "question": "A 'force' makes the spectator pick a?",
    "choices": [
      "random card",
      "specific card",
      "red card",
      "ace"
    ],
    "correct": 1
  },
  {
    "question": "The 'double lift' shows?",
    "choices": [
      "two cards as one",
      "two decks",
      "two volunteers",
      "two backs"
    ],
    "correct": 0
  },
  {
    "question": "Dai Vernon was nicknamed?",
    "choices": [
      "The Magician",
      "The Professor",
      "The Ace",
      "The Mage"
    ],
    "correct": 1
  },
  {
    "question": "A 'cull' is a method of?",
    "choices": [
      "dealing cards",
      "secretly moving a card",
      "cutting a deck",
      "shuffling"
    ],
    "correct": 1
  },
  {
    "question": "'Sleight of hand' refers primarily to?",
    "choices": [
      "camera tricks",
      "manual dexterity",
      "mind reading",
      "hypnosis"
    ],
    "correct": 1
  },
  {
    "question": "A 'palm' hides a card in?",
    "choices": [
      "the sleeve",
      "the hand",
      "the pocket",
      "the deck"
    ],
    "correct": 1
  },
  {
    "question": "An 'Ambitious Card' routine repeatedly returns the card to?",
    "choices": [
      "the bottom",
      "the middle",
      "the top",
      "the spectator"
    ],
    "correct": 2
  },
  {
    "question": "Ricky Jay was a famous?",
    "choices": [
      "mentalist",
      "card magician",
      "escape artist",
      "ventriloquist"
    ],
    "correct": 1
  },
  {
    "question": "A 'pass' is used to?",
    "choices": [
      "change the order",
      "secretly cut to a card",
      "reveal a card",
      "replace a card"
    ],
    "correct": 1
  },
  {
    "question": "Marked decks rely on?",
    "choices": [
      "color",
      "secret back markings",
      "rough edges",
      "weights"
    ],
    "correct": 1
  },
  {
    "question": "A 'fan' display shows the?",
    "choices": [
      "jokers",
      "face cards",
      "entire deck spread",
      "backs only"
    ],
    "correct": 2
  },
  {
    "question": "Howard Thurston was known for?",
    "choices": [
      "dove magic",
      "stage card manipulation",
      "mentalism",
      "tightrope"
    ],
    "correct": 1
  },
  {
    "question": "A 'false shuffle' preserves?",
    "choices": [
      "the suits",
      "the deck order",
      "the colors",
      "the value"
    ],
    "correct": 1
  },
  {
    "question": "Three Card Monte is a famous?",
    "choices": [
      "card trick",
      "con/short con",
      "stage trick",
      "mentalism act"
    ],
    "correct": 1
  },
  {
    "question": "The 'Charlier cut' is performed with?",
    "choices": [
      "both hands",
      "one hand",
      "the deck on table",
      "two decks"
    ],
    "correct": 1
  },
  {
    "question": "Cardistry is the art of?",
    "choices": [
      "card magic",
      "flourishing",
      "gambling",
      "tarot"
    ],
    "correct": 1
  },
  {
    "question": "A 'glide' secretly retains?",
    "choices": [
      "the top card",
      "the bottom card",
      "the middle card",
      "the joker"
    ],
    "correct": 1
  },
  {
    "question": "A 'mexican turnover' switches?",
    "choices": [
      "two decks",
      "two cards face up",
      "colors",
      "suits"
    ],
    "correct": 1
  },
  {
    "question": "Erdnase wrote 'The Expert at the' what?",
    "choices": [
      "Bridge Table",
      "Card Table",
      "Poker Table",
      "Magic Table"
    ],
    "correct": 1
  }
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
