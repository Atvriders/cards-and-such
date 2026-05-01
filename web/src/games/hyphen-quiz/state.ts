import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HyphenQuizSettings { questions: "8" | "10" | "12"; }
export interface HyphenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HyphenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "well known author",
    "well-known author",
    "wellknown author",
    "well known-author"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "self-esteem",
    "selfesteem",
    "self esteem",
    "self-,esteem"
  ],
  "correct": 0
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "mother in law",
    "motherinlaw",
    "mother-in-law",
    "mother in-law"
  ],
  "correct": 2
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "twenty one",
    "twenty-one",
    "twentyone",
    "twenty,one"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "ex-president",
    "ex president",
    "expresident",
    "ex,president"
  ],
  "correct": 0
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "high quality work",
    "high-quality work",
    "highquality work",
    "high quality-work"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "long term plan",
    "long-term plan",
    "longterm plan",
    "long term-plan"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "state of the art",
    "state-of-the-art",
    "stateoftheart",
    "state of-the-art"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "check in time",
    "check-in time",
    "checkin time",
    "check in-time"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "full time job",
    "full-time job",
    "fulltime job",
    "full time-job"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "part time worker",
    "part-time worker",
    "parttime worker",
    "part time-worker"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "editor in chief",
    "editor-in-chief",
    "editorinchief",
    "editor in-chief"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "forty two",
    "forty-two",
    "fortytwo",
    "forty,two"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "pre-existing",
    "preexisting",
    "pre existing",
    "pre,existing"
  ],
  "correct": 0
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "co-worker",
    "coworker",
    "co worker",
    "co,worker"
  ],
  "correct": 0
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "t-shirt",
    "tshirt",
    "t shirt",
    "tee-shirt-,"
  ],
  "correct": 0
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "x-ray",
    "xray",
    "x ray",
    "x,ray"
  ],
  "correct": 0
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "runner up",
    "runner-up",
    "runnerup",
    "runner,up"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "father in law",
    "father-in-law",
    "fatherinlaw",
    "father in-law"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "son in law",
    "son-in-law",
    "soninlaw",
    "son in-law"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "good looking",
    "good-looking",
    "goodlooking",
    "good,looking"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "over the counter",
    "over-the-counter",
    "overthecounter",
    "over the-counter"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "one third",
    "one-third",
    "onethird",
    "one,third"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "self-aware",
    "selfaware",
    "self aware",
    "self,aware"
  ],
  "correct": 0
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "non profit",
    "non-profit",
    "nonprofit (also acceptable)",
    "non,profit"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "up to date info",
    "up-to-date info",
    "uptodate info",
    "up to-date info"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "face to face",
    "face-to-face",
    "facetoface",
    "face to-face"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "brother in law",
    "brother-in-law",
    "brotherinlaw",
    "brother in-law"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "five year old child",
    "five-year-old child",
    "fiveyearold child",
    "five year-old child"
  ],
  "correct": 1
},
{
  "question": "Which is correctly hyphenated?",
  "choices": [
    "step by step",
    "step-by-step",
    "stepbystep",
    "step by-step"
  ],
  "correct": 1
}
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HyphenQuizSettings): HyphenQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HyphenQuizState, action: HyphenQuizAction): HyphenQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HyphenQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
