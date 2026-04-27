import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen20sQuizSettings { questions: "10" | "15"; }
export interface Nineteen20sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen20sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What U.S. Constitutional amendment banned alcohol in 1920?",
    "choices": [
      "17th",
      "18th",
      "19th",
      "20th"
    ],
    "correct": 1
  },
  {
    "question": "Who flew solo across the Atlantic in 1927?",
    "choices": [
      "Amelia Earhart",
      "Charles Lindbergh",
      "Wright Brothers",
      "Howard Hughes"
    ],
    "correct": 1
  },
  {
    "question": "Which novel by F. Scott Fitzgerald was published in 1925?",
    "choices": [
      "The Sun Also Rises",
      "The Great Gatsby",
      "Tender Is the Night",
      "This Side of Paradise"
    ],
    "correct": 1
  },
  {
    "question": "What was the name of the cultural movement among Black Americans in 1920s New York?",
    "choices": [
      "Harlem Renaissance",
      "Bronx Boom",
      "Manhattan Movement",
      "Brooklyn Beat"
    ],
    "correct": 0
  },
  {
    "question": "What dance, full of kicks, defined the 1920s?",
    "choices": [
      "Foxtrot",
      "Charleston",
      "Lindy Hop",
      "Tango"
    ],
    "correct": 1
  },
  {
    "question": "The 19th Amendment, ratified in 1920, granted whom the right to vote?",
    "choices": [
      "18-year-olds",
      "Native Americans",
      "Women",
      "African Americans"
    ],
    "correct": 2
  },
  {
    "question": "Which baseball star hit 60 home runs in 1927?",
    "choices": [
      "Lou Gehrig",
      "Ty Cobb",
      "Babe Ruth",
      "Joe DiMaggio"
    ],
    "correct": 2
  },
  {
    "question": "What 1929 event triggered the Great Depression?",
    "choices": [
      "Pearl Harbor",
      "Stock Market Crash",
      "Dust Bowl",
      "Spanish Flu"
    ],
    "correct": 1
  },
  {
    "question": "Who was the gangster king of Chicago bootlegging?",
    "choices": [
      "Lucky Luciano",
      "Al Capone",
      "John Dillinger",
      "Bugs Moran"
    ],
    "correct": 1
  },
  {
    "question": "The first sound (talkie) feature film, 1927, was?",
    "choices": [
      "Metropolis",
      "The Jazz Singer",
      "Steamboat Willie",
      "Nosferatu"
    ],
    "correct": 1
  },
  {
    "question": "Calvin Coolidge was U.S. President during most of the 1920s. His nickname was?",
    "choices": [
      "Silent Cal",
      "Honest Cal",
      "Lightning Cal",
      "Rough Cal"
    ],
    "correct": 0
  },
  {
    "question": "Which famous 1920s trial debated teaching evolution?",
    "choices": [
      "Lindbergh Trial",
      "Scopes Monkey Trial",
      "Sacco-Vanzetti",
      "Leopold Loeb"
    ],
    "correct": 1
  },
  {
    "question": "What 1920s economy term referred to mass-produced goods on credit?",
    "choices": [
      "Consumerism",
      "Mercantilism",
      "Industrialism",
      "Manorialism"
    ],
    "correct": 0
  },
  {
    "question": "Who composed Rhapsody in Blue in 1924?",
    "choices": [
      "Cole Porter",
      "George Gershwin",
      "Irving Berlin",
      "Duke Ellington"
    ],
    "correct": 1
  },
  {
    "question": "Which short, knee-baring fashion defined 1920s women?",
    "choices": [
      "Hoop skirt",
      "Flapper dress",
      "Bustle gown",
      "A-line"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen20sQuizSettings): Nineteen20sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen20sQuizState, action: Nineteen20sQuizAction): Nineteen20sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen20sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
