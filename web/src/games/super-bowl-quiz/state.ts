import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SuperBowlQuizSettings { questions: "10" | "20" | "30"; }
export interface SuperBowlQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SuperBowlQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who won Super Bowl I?",
    "choices": [
      "Packers",
      "Chiefs",
      "Cowboys",
      "Steelers"
    ],
    "correct": 0
  },
  {
    "question": "Most Super Bowl wins as QB?",
    "choices": [
      "Montana",
      "Brady",
      "Manning",
      "Bradshaw"
    ],
    "correct": 1
  },
  {
    "question": "Which team won Super Bowl LVIII?",
    "choices": [
      "49ers",
      "Chiefs",
      "Eagles",
      "Bengals"
    ],
    "correct": 1
  },
  {
    "question": "Who is the 'GOAT' QB by most fans?",
    "choices": [
      "Brady",
      "Montana",
      "Manning",
      "Rodgers"
    ],
    "correct": 0
  },
  {
    "question": "Halftime show in 1993 starred?",
    "choices": [
      "Madonna",
      "Michael Jackson",
      "Prince",
      "Beyoncé"
    ],
    "correct": 1
  },
  {
    "question": "Patriots won Super Bowl XXXVI vs?",
    "choices": [
      "Eagles",
      "Rams",
      "Panthers",
      "Seahawks"
    ],
    "correct": 1
  },
  {
    "question": "Who threw 'The Tuck Rule' play?",
    "choices": [
      "Brady",
      "Bledsoe",
      "Favre",
      "Brees"
    ],
    "correct": 0
  },
  {
    "question": "Bart Starr won MVP in?",
    "choices": [
      "I and II",
      "II and III",
      "I and III",
      "II only"
    ],
    "correct": 0
  },
  {
    "question": "Which team has most Super Bowl losses?",
    "choices": [
      "Vikings",
      "Bills",
      "Broncos",
      "Patriots"
    ],
    "correct": 1
  },
  {
    "question": "Doug Williams was first Black QB to win SB in?",
    "choices": [
      "1983",
      "1988",
      "1991",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Who threw 'The Helmet Catch' to in SB XLII?",
    "choices": [
      "Tyree",
      "Burress",
      "Manningham",
      "Cruz"
    ],
    "correct": 0
  },
  {
    "question": "Where was Super Bowl LVII played?",
    "choices": [
      "Glendale",
      "Tampa",
      "Inglewood",
      "Atlanta"
    ],
    "correct": 0
  },
  {
    "question": "Most Super Bowl rings as a player?",
    "choices": [
      "Brady",
      "Montana",
      "Bradshaw",
      "Robinson"
    ],
    "correct": 0
  },
  {
    "question": "Steelers won how many Super Bowls in 1970s?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Which team won 'The Drive' game (AFC Championship 1986)?",
    "choices": [
      "Browns",
      "Broncos",
      "Bills",
      "Bengals"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SuperBowlQuizSettings): SuperBowlQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SuperBowlQuizState, action: SuperBowlQuizAction): SuperBowlQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SuperBowlQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
