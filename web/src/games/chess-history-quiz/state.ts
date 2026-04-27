import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChessHistoryQuizSettings { questions: "10" | "20"; }
export interface ChessHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChessHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who was the first official World Chess Champion?",
    "choices": [
      "Wilhelm Steinitz",
      "Emanuel Lasker",
      "Paul Morphy",
      "Adolf Anderssen"
    ],
    "correct": 0
  },
  {
    "question": "Bobby Fischer became champion in what year?",
    "choices": [
      "1969",
      "1972",
      "1975",
      "1978"
    ],
    "correct": 1
  },
  {
    "question": "The Sicilian Defense begins with which move by Black?",
    "choices": [
      "e5",
      "c5",
      "e6",
      "c6"
    ],
    "correct": 1
  },
  {
    "question": "Magnus Carlsen first became World Champion in?",
    "choices": [
      "2010",
      "2013",
      "2016",
      "2018"
    ],
    "correct": 1
  },
  {
    "question": "Garry Kasparov lost to which computer in 1997?",
    "choices": [
      "Deep Thought",
      "Deep Blue",
      "Stockfish",
      "AlphaZero"
    ],
    "correct": 1
  },
  {
    "question": "The Queen's Gambit begins with?",
    "choices": [
      "1.e4",
      "1.d4",
      "1.Nf3",
      "1.c4"
    ],
    "correct": 1
  },
  {
    "question": "Which player was known as 'The Magician of Riga'?",
    "choices": [
      "Spassky",
      "Tal",
      "Petrosian",
      "Botvinnik"
    ],
    "correct": 1
  },
  {
    "question": "How many squares on a chessboard?",
    "choices": [
      "48",
      "56",
      "64",
      "72"
    ],
    "correct": 2
  },
  {
    "question": "The 'Immortal Game' was played by Anderssen vs?",
    "choices": [
      "Steinitz",
      "Kieseritzky",
      "Morphy",
      "Zukertort"
    ],
    "correct": 1
  },
  {
    "question": "Which opening starts 1.e4 e5 2.Nf3 Nc6 3.Bb5?",
    "choices": [
      "Italian",
      "Ruy Lopez",
      "Scotch",
      "King's Gambit"
    ],
    "correct": 1
  },
  {
    "question": "Anatoly Karpov was champion from?",
    "choices": [
      "1969-1985",
      "1972-1975",
      "1975-1985",
      "1985-2000"
    ],
    "correct": 2
  },
  {
    "question": "The 'King's Indian Defense' is a defense against?",
    "choices": [
      "1.e4",
      "1.d4",
      "1.c4",
      "1.Nf3"
    ],
    "correct": 1
  },
  {
    "question": "FIDE was founded in?",
    "choices": [
      "1924",
      "1934",
      "1948",
      "1950"
    ],
    "correct": 0
  },
  {
    "question": "Which player wrote 'My System'?",
    "choices": [
      "Capablanca",
      "Alekhine",
      "Nimzowitsch",
      "Reti"
    ],
    "correct": 2
  },
  {
    "question": "The chess piece that moves in an L-shape is the?",
    "choices": [
      "Bishop",
      "Knight",
      "Rook",
      "Queen"
    ],
    "correct": 1
  },
  {
    "question": "Who is Magnus Carlsen's home country?",
    "choices": [
      "Sweden",
      "Denmark",
      "Norway",
      "Iceland"
    ],
    "correct": 2
  },
  {
    "question": "Capablanca was from?",
    "choices": [
      "Cuba",
      "Spain",
      "Mexico",
      "Argentina"
    ],
    "correct": 0
  },
  {
    "question": "The longest theoretical chess game is around?",
    "choices": [
      "50 moves",
      "100 moves",
      "5,949 moves",
      "Unlimited"
    ],
    "correct": 2
  },
  {
    "question": "Stalemate results in?",
    "choices": [
      "Win",
      "Loss",
      "Draw",
      "Replay"
    ],
    "correct": 2
  },
  {
    "question": "The 'Fool's Mate' takes how many moves?",
    "choices": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChessHistoryQuizSettings): ChessHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChessHistoryQuizState, action: ChessHistoryQuizAction): ChessHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChessHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
