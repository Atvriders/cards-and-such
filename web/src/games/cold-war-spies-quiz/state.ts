import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ColdWarSpiesQuizSettings { questions: "10" | "20"; }
export interface ColdWarSpiesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ColdWarSpiesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which group of British spies fed Soviets secrets in WWII and after?",
    "choices": [
      "The Magnificent Seven",
      "The Cambridge Five",
      "The Oxford Three",
      "The London Six"
    ],
    "correct": 1
  },
  {
    "question": "Which Cambridge spy fled to the USSR in 1963?",
    "choices": [
      "Guy Burgess",
      "Donald Maclean",
      "Kim Philby",
      "Anthony Blunt"
    ],
    "correct": 2
  },
  {
    "question": "U.S. couple executed in 1953 for atomic espionage?",
    "choices": [
      "Hisses",
      "Rosenbergs",
      "Sobles",
      "Cohens"
    ],
    "correct": 1
  },
  {
    "question": "Soviet defector Oleg ___ exposed many KGB operations.",
    "choices": [
      "Penkovsky",
      "Gordievsky",
      "Kalugin",
      "Rezun"
    ],
    "correct": 1
  },
  {
    "question": "Bridge in Berlin used for spy swaps?",
    "choices": [
      "Glienicke",
      "Oberbaum",
      "Bornholmer",
      "Charlottenburg"
    ],
    "correct": 0
  },
  {
    "question": "U.S. pilot shot down over USSR in a U-2 spy plane (1960)?",
    "choices": [
      "Francis Gary Powers",
      "Chuck Yeager",
      "Scott Crossfield",
      "Iven Kincheloe"
    ],
    "correct": 0
  },
  {
    "question": "Which physicist passed atomic secrets and was sentenced in 1950?",
    "choices": [
      "Klaus Fuchs",
      "Edward Teller",
      "Robert Oppenheimer",
      "Hans Bethe"
    ],
    "correct": 0
  },
  {
    "question": "Soviet illegal arrested in NYC, played by Mark Rylance in 'Bridge of Spies'?",
    "choices": [
      "Vasili Mitrokhin",
      "Rudolf Abel",
      "Konon Molody",
      "Vitaly Yurchenko"
    ],
    "correct": 1
  },
  {
    "question": "Which CIA officer was a long-term Soviet mole, exposed in 1994?",
    "choices": [
      "Aldrich Ames",
      "Robert Hanssen",
      "Edward Lee Howard",
      "Harold Nicholson"
    ],
    "correct": 0
  },
  {
    "question": "FBI agent who spied for Moscow until arrested in 2001?",
    "choices": [
      "Aldrich Ames",
      "Robert Hanssen",
      "Earl Pitts",
      "Brian Kelley"
    ],
    "correct": 1
  },
  {
    "question": "Which Soviet GRU colonel passed key Cuban missile crisis intel to West?",
    "choices": [
      "Penkovsky",
      "Polyakov",
      "Gordievsky",
      "Tolkachev"
    ],
    "correct": 0
  },
  {
    "question": "Which spy ring run by John Walker compromised U.S. Navy comms?",
    "choices": [
      "Walker spy ring",
      "Pollard ring",
      "Larkin ring",
      "Conrad ring"
    ],
    "correct": 0
  },
  {
    "question": "What was 'Operation Gold' (1955)?",
    "choices": [
      "Berlin tunnel for Soviet wiretap",
      "Cuba assassination plot",
      "Korean radar mission",
      "Vienna asset extraction"
    ],
    "correct": 0
  },
  {
    "question": "Which novelist (former MI6) wrote 'Tinker Tailor Soldier Spy'?",
    "choices": [
      "Graham Greene",
      "John le Carré",
      "Ian Fleming",
      "Frederick Forsyth"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ColdWarSpiesQuizSettings): ColdWarSpiesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ColdWarSpiesQuizState, action: ColdWarSpiesQuizAction): ColdWarSpiesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ColdWarSpiesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
