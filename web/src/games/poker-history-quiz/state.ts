import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PokerHistoryQuizSettings { questions: "10" | "20"; }
export interface PokerHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PokerHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Texas Hold'em was popularized in which decade?",
    "choices": [
      "1950s",
      "1960s",
      "1970s",
      "1980s"
    ],
    "correct": 2
  },
  {
    "question": "The 'Dead Man's Hand' contains aces and?",
    "choices": [
      "kings",
      "queens",
      "eights",
      "tens"
    ],
    "correct": 2
  },
  {
    "question": "How many cards in a standard poker deck?",
    "choices": [
      "48",
      "50",
      "52",
      "54"
    ],
    "correct": 2
  },
  {
    "question": "The World Series of Poker began in?",
    "choices": [
      "1965",
      "1970",
      "1975",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "A 'flush' contains five cards of the same?",
    "choices": [
      "rank",
      "suit",
      "color",
      "value"
    ],
    "correct": 1
  },
  {
    "question": "Which hand beats a full house?",
    "choices": [
      "Flush",
      "Straight",
      "Four of a kind",
      "Three of a kind"
    ],
    "correct": 2
  },
  {
    "question": "The highest single card in poker is?",
    "choices": [
      "King",
      "Queen",
      "Jack",
      "Ace"
    ],
    "correct": 3
  },
  {
    "question": "'Pocket rockets' refers to?",
    "choices": [
      "AA",
      "KK",
      "QQ",
      "JJ"
    ],
    "correct": 0
  },
  {
    "question": "Omaha players are dealt how many hole cards?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 2
  },
  {
    "question": "Phil Hellmuth has won how many WSOP bracelets (record)?",
    "choices": [
      "10",
      "13",
      "16",
      "20"
    ],
    "correct": 2
  },
  {
    "question": "The 'flop' shows how many community cards?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "question": "A 'straight flush' is five cards in?",
    "choices": [
      "any order",
      "sequence same suit",
      "sequence",
      "same suit"
    ],
    "correct": 1
  },
  {
    "question": "In Stud, hole cards remain?",
    "choices": [
      "face up",
      "hidden",
      "exposed",
      "shared"
    ],
    "correct": 1
  },
  {
    "question": "Razz is a form of?",
    "choices": [
      "High poker",
      "Low poker",
      "Wild poker",
      "Limit only"
    ],
    "correct": 1
  },
  {
    "question": "The 'small blind' is usually?",
    "choices": [
      "double the big blind",
      "equal",
      "half the big blind",
      "quarter"
    ],
    "correct": 2
  },
  {
    "question": "Doyle Brunson wrote which classic poker book?",
    "choices": [
      "Super/System",
      "Caro's Book",
      "Theory of Poker",
      "Harrington"
    ],
    "correct": 0
  },
  {
    "question": "A 'gutshot' refers to?",
    "choices": [
      "weak bluff",
      "inside straight draw",
      "check raise",
      "slowplay"
    ],
    "correct": 1
  },
  {
    "question": "How many possible 5-card poker hands?",
    "choices": [
      "~250,000",
      "~1.5M",
      "~2.6M",
      "~10M"
    ],
    "correct": 2
  },
  {
    "question": "Caribbean Stud is played against?",
    "choices": [
      "players",
      "the dealer",
      "the bank",
      "other tables"
    ],
    "correct": 1
  },
  {
    "question": "Which is the highest pair?",
    "choices": [
      "Aces",
      "Kings",
      "Queens",
      "Jacks"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PokerHistoryQuizSettings): PokerHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PokerHistoryQuizState, action: PokerHistoryQuizAction): PokerHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PokerHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
