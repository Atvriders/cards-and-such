import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreatTrainRobberyQuizSettings { questions: "10" | "20"; }
export interface GreatTrainRobberyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreatTrainRobberyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "When did the Great Train Robbery occur?",
    "choices": [
      "1955",
      "1963",
      "1968",
      "1972"
    ],
    "correct": 1
  },
  {
    "question": "Where did the robbery take place?",
    "choices": [
      "Bridego Bridge",
      "Watford Gap",
      "Crewe Junction",
      "Clapham Tunnel"
    ],
    "correct": 0
  },
  {
    "question": "What train was robbed?",
    "choices": [
      "Flying Scotsman",
      "Glasgow-London Royal Mail",
      "Brighton Belle",
      "Cornish Express"
    ],
    "correct": 1
  },
  {
    "question": "Which robber famously escaped from Wandsworth Prison?",
    "choices": [
      "Bruce Reynolds",
      "Ronnie Biggs",
      "Buster Edwards",
      "Charlie Wilson"
    ],
    "correct": 1
  },
  {
    "question": "Who was widely seen as the gang's mastermind?",
    "choices": [
      "Bruce Reynolds",
      "Ronnie Biggs",
      "Roy James",
      "Tommy Wisbey"
    ],
    "correct": 0
  },
  {
    "question": "Where did the gang hide after the robbery?",
    "choices": [
      "Leatherslade Farm",
      "Beachy Head",
      "Box Hill",
      "Dover Castle"
    ],
    "correct": 0
  },
  {
    "question": "Roughly how much (in 1963 pounds) was stolen?",
    "choices": [
      "£10,000",
      "£260,000",
      "£2.6 million",
      "£26 million"
    ],
    "correct": 2
  },
  {
    "question": "Ronnie Biggs fled to which country for years?",
    "choices": [
      "Argentina",
      "Brazil",
      "Spain",
      "Australia"
    ],
    "correct": 1
  },
  {
    "question": "Who later wrote a memoir titled 'Crossing the Line'?",
    "choices": [
      "Bruce Reynolds",
      "Ronnie Biggs",
      "Buster Edwards",
      "Charlie Wilson"
    ],
    "correct": 0
  },
  {
    "question": "Which Hollywood film loosely depicts the robbery?",
    "choices": [
      "Ocean's Eleven",
      "Buster",
      "The Italian Job",
      "The Sting"
    ],
    "correct": 1
  },
  {
    "question": "Phil Collins played which robber in 'Buster'?",
    "choices": [
      "Bruce Reynolds",
      "Buster Edwards",
      "Ronnie Biggs",
      "Roy James"
    ],
    "correct": 1
  },
  {
    "question": "What weapon did the robbers carry?",
    "choices": [
      "Revolvers",
      "Cosh and pickaxe handles",
      "Sawn-off shotguns",
      "Knives"
    ],
    "correct": 1
  },
  {
    "question": "Which detective led the investigation?",
    "choices": [
      "Jack Slipper",
      "George Hatherill",
      "Tommy Butler",
      "Frank Williams"
    ],
    "correct": 2
  },
  {
    "question": "What did the gang use to stop the train?",
    "choices": [
      "A fake red signal",
      "Roadblock",
      "Flagman",
      "Loud horns"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GreatTrainRobberyQuizSettings): GreatTrainRobberyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GreatTrainRobberyQuizState, action: GreatTrainRobberyQuizAction): GreatTrainRobberyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GreatTrainRobberyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
