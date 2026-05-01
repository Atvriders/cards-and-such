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
    "question": "Bobby Fischer became World Champion in what year?",
    "choices": [
      "1969",
      "1972",
      "1975",
      "1978"
    ],
    "correct": 1
  },
  {
    "question": "The Sicilian Defense begins with which Black move?",
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
    "question": "Garry Kasparov lost to which IBM computer in 1997?",
    "choices": [
      "Deep Thought",
      "Deep Blue",
      "Fritz",
      "Stockfish"
    ],
    "correct": 1
  },
  {
    "question": "How many squares on a standard chess board?",
    "choices": [
      "49",
      "56",
      "64",
      "72"
    ],
    "correct": 2
  },
  {
    "question": "Which piece moves only diagonally?",
    "choices": [
      "Rook",
      "Knight",
      "Bishop",
      "Queen"
    ],
    "correct": 2
  },
  {
    "question": "The opening move 1.e4 e5 2.Nf3 Nc6 3.Bb5 is called?",
    "choices": [
      "Italian Game",
      "Ruy Lopez",
      "Scotch Game",
      "Vienna Game"
    ],
    "correct": 1
  },
  {
    "question": "En passant can only be played by which piece?",
    "choices": [
      "Knight",
      "Bishop",
      "Pawn",
      "Rook"
    ],
    "correct": 2
  },
  {
    "question": "Castling moves the king how many squares?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 1
  },
  {
    "question": "Who held the World Championship from 1985 to 2000?",
    "choices": [
      "Karpov",
      "Kasparov",
      "Kramnik",
      "Spassky"
    ],
    "correct": 1
  },
  {
    "question": "FIDE was founded in what year?",
    "choices": [
      "1924",
      "1934",
      "1944",
      "1954"
    ],
    "correct": 0
  },
  {
    "question": "The Queen's Gambit begins with?",
    "choices": [
      "1.e4",
      "1.d4 d5 2.c4",
      "1.Nf3",
      "1.c4"
    ],
    "correct": 1
  },
  {
    "question": "Paul Morphy was from which country?",
    "choices": [
      "England",
      "France",
      "USA",
      "Germany"
    ],
    "correct": 2
  },
  {
    "question": "The longest official world title match was between Karpov and?",
    "choices": [
      "Kasparov",
      "Korchnoi",
      "Spassky",
      "Fischer"
    ],
    "correct": 0
  },
  {
    "question": "Which Indian became World Champion in 2007?",
    "choices": [
      "Anand",
      "Sasikiran",
      "Harikrishna",
      "Negi"
    ],
    "correct": 0
  },
  {
    "question": "A 'zugzwang' position means?",
    "choices": [
      "Forced win",
      "Any move worsens",
      "Stalemate",
      "Forced draw"
    ],
    "correct": 1
  },
  {
    "question": "The fastest possible checkmate is called?",
    "choices": [
      "Scholar's mate",
      "Fool's mate",
      "Smothered mate",
      "Back rank mate"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'My System'?",
    "choices": [
      "Capablanca",
      "Nimzowitsch",
      "Tarrasch",
      "Lasker"
    ],
    "correct": 1
  },
  {
    "question": "Vishy Anand's home city is?",
    "choices": [
      "Mumbai",
      "Chennai",
      "Delhi",
      "Kolkata"
    ],
    "correct": 1
  },
  {
    "question": "The King's Indian Defense is played by?",
    "choices": [
      "White",
      "Black",
      "Either",
      "Computers"
    ],
    "correct": 1
  },
  {
    "question": "How many pawns does each side begin with?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 2
  },
  {
    "question": "Stalemate results in?",
    "choices": [
      "White wins",
      "Black wins",
      "Draw",
      "Replay"
    ],
    "correct": 2
  },
  {
    "question": "Capablanca was from which country?",
    "choices": [
      "Cuba",
      "Spain",
      "Mexico",
      "Argentina"
    ],
    "correct": 0
  },
  {
    "question": "Hou Yifan is best known for being?",
    "choices": [
      "Youngest GM",
      "Top women's player",
      "Streamer",
      "Trainer"
    ],
    "correct": 1
  },
  {
    "question": "AlphaZero was developed by?",
    "choices": [
      "IBM",
      "Google DeepMind",
      "Microsoft",
      "OpenAI"
    ],
    "correct": 1
  },
  {
    "question": "The 50-move rule allows a draw if no pawn moves and no?",
    "choices": [
      "Check",
      "Capture",
      "Castle",
      "Promotion"
    ],
    "correct": 1
  },
  {
    "question": "Which piece is worth approximately 9 points?",
    "choices": [
      "Bishop",
      "Rook",
      "Queen",
      "Knight"
    ],
    "correct": 2
  },
  {
    "question": "Mikhail Tal was nicknamed?",
    "choices": [
      "Magician of Riga",
      "Iron Tigran",
      "Lion of London",
      "Beast of Baku"
    ],
    "correct": 0
  },
  {
    "question": "The Berlin Defense is a variation of?",
    "choices": [
      "Sicilian",
      "Ruy Lopez",
      "French",
      "Caro-Kann"
    ],
    "correct": 1
  },
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
