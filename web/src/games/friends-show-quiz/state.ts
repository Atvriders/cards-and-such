import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FriendsShowSettings { questions: "10" | "20" | "30"; }
export interface FriendsShowState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FriendsShowAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what city is Friends set?", choices: ["New York","Los Angeles","Chicago","Boston"], correct: 0 },
  { question: "How many seasons did Friends have?", choices: ["10","9","8","12"], correct: 0 },
  { question: "What years did Friends air?", choices: ["1994-2004","1992-2002","1996-2006","1998-2008"], correct: 0 },
  { question: "Who plays Rachel?", choices: ["Jennifer Aniston","Courteney Cox","Lisa Kudrow","Maggie Wheeler"], correct: 0 },
  { question: "Who plays Monica?", choices: ["Courteney Cox","Jennifer Aniston","Lisa Kudrow","Janeane Garofalo"], correct: 0 },
  { question: "Who plays Phoebe?", choices: ["Lisa Kudrow","Courteney Cox","Jennifer Aniston","Christina Pickles"], correct: 0 },
  { question: "Who plays Ross?", choices: ["David Schwimmer","Matthew Perry","Matt LeBlanc","Tom Selleck"], correct: 0 },
  { question: "Who plays Chandler?", choices: ["Matthew Perry","David Schwimmer","Matt LeBlanc","Tom Selleck"], correct: 0 },
  { question: "Who plays Joey?", choices: ["Matt LeBlanc","Matthew Perry","David Schwimmer","Steve Zahn"], correct: 0 },
  { question: "What is Joey's catchphrase?", choices: ["How you doin'?","Could I be more...?","Smelly cat","Pivot"], correct: 0 },
  { question: "What's Chandler's catchphrase style?", choices: ["Could X be any more Y?","How you doin","Pivot","Smelly cat"], correct: 0 },
  { question: "What song does Phoebe famously play?", choices: ["Smelly Cat","Black Friday","Sticky Shoes","Crazy Underwear"], correct: 0 },
  { question: "What's Phoebe's twin sister?", choices: ["Ursula","Lily","Estelle","Janice"], correct: 0 },
  { question: "What's Ross's profession?", choices: ["Paleontologist","Chef","Actor","Lawyer"], correct: 0 },
  { question: "What's Monica's profession?", choices: ["Chef","Paleontologist","Massage therapist","Actress"], correct: 0 },
  { question: "What's Joey's profession?", choices: ["Actor","Chef","Paleontologist","Lawyer"], correct: 0 },
  { question: "What's the name of the coffee shop?", choices: ["Central Perk","Java Hut","Coffee Bean","Common Grounds"], correct: 0 },
  { question: "What's Ross's son's name?", choices: ["Ben","Emma","Frank","Jack"], correct: 0 },
  { question: "What's Ross and Rachel's daughter?", choices: ["Emma","Ben","Lily","Erica"], correct: 0 },
  { question: "Who does Monica marry?", choices: ["Chandler","Pete","Richard","Tom Selleck (no - Richard)"], correct: 0 },
  { question: "What's Chandler's middle name?", choices: ["Muriel","Bing","Joseph","Francis"], correct: 0 },
  { question: "What's Phoebe's husband's name?", choices: ["Mike Hannigan","David","Gary","Ross"], correct: 0 },
  { question: "Who plays Phoebe's husband Mike?", choices: ["Paul Rudd","Hank Azaria","Tom Selleck","Bruce Willis"], correct: 0 },
  { question: "What is Janice's catchphrase?", choices: ["Oh. My. God.","Pivot","How you doin","Smelly cat"], correct: 0 },
  { question: "Who plays Janice?", choices: ["Maggie Wheeler","Jane Lynch","Christina Pickles","Marlo Thomas"], correct: 0 },
  { question: "What episode is The One Where Everybody Finds Out?", choices: ["Season 5 Ep 14","Season 4","Season 6","Season 3"], correct: 0 },
  { question: "What's Smelly Cat's first line?", choices: ["Smelly cat, smelly cat","I will always love you","You are not a","Just smelly cat"], correct: 0 },
  { question: "What's Joey's stuffed penguin?", choices: ["Hugsy","Mr. Penguin","Steve","Buddy"], correct: 0 },
  { question: "Who appears as Rachel's pregnant rival? (no, played by Helen Hunt? no - was Reese Witherspoon as Jill)", choices: ["Reese Witherspoon plays Jill","Jennifer Lopez","No one","Lisa Kudrow's twin"], correct: 0 },
  { question: "What's the show's theme song?", choices: ["I'll Be There for You","Smelly Cat","Friends Theme","All Time Low"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FriendsShowSettings): FriendsShowState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FriendsShowState, action: FriendsShowAction): FriendsShowState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FriendsShowState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
