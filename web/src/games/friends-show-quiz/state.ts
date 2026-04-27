import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FriendsShowSettings { questions: "10" | "20" | "30"; }
export interface FriendsShowState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FriendsShowAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is Joey's catchphrase?", choices: ["How are you?","How you doin'?","What's up?","Hey buddy"], correct: 1 },
  { question: "Who marries Monica?", choices: ["Joey","Ross","Chandler","Richard"], correct: 2 },
  { question: "What is Ross's profession?", choices: ["Doctor","Paleontologist","Lawyer","Chef"], correct: 1 },
  { question: "Phoebe sings about a what?", choices: ["Smelly Cat","Tiny Dog","Fat Bird","Old Man"], correct: 0 },
  { question: "Where do they get coffee?", choices: ["Starbucks","Central Perk","Joe's","Cafe Nervosa"], correct: 1 },
  { question: "Rachel's daughter is named?", choices: ["Erica","Emma","Ella","Eva"], correct: 1 },
  { question: "Who is Ross's second wife?", choices: ["Carol","Emily","Rachel","Julie"], correct: 1 },
  { question: "Joey's stuffed penguin is named?", choices: ["Hugsy","Mr. Cuddles","Penguini","Floppy"], correct: 0 },
  { question: "Where do Monica and Rachel live?", choices: ["Brooklyn","Manhattan","Queens","New Jersey"], correct: 1 },
  { question: "Chandler's job involves?", choices: ["Statistical analysis","Advertising","Law","Medicine"], correct: 0 },
  { question: "The 'PIVOT!' scene is for?", choices: ["A bed","A couch","A table","A piano"], correct: 1 },
  { question: "Who is Ben's mom?", choices: ["Susan","Carol","Rachel","Jill"], correct: 1 },
  { question: "Phoebe's twin sister is?", choices: ["Ursula","Ulla","Phoebe Sr","Lily"], correct: 0 },
  { question: "The Geller Cup trophy is?", choices: ["The Soup Bowl","The Geller Cup","Football","The Waffle"], correct: 1 },
  { question: "Ross dated who at the Museum?", choices: ["Julie","Charlie","Mona","Bonnie"], correct: 0 },
  { question: "What was Joey's soap opera?", choices: ["Days of our Lives","General Hospital","All My Children","The Bold"], correct: 0 },
  { question: "Who said 'WE WERE ON A BREAK'?", choices: ["Rachel","Ross","Joey","Chandler"], correct: 1 },
  { question: "Monica's chef restaurant is?", choices: ["Allesandro's","Javu","Bobby Flay's","Iridium"], correct: 0 },
  { question: "Ross's monkey was named?", choices: ["Marcel","Bananas","Moe","Coco"], correct: 0 },
  { question: "The fountain intro song is by?", choices: ["The Rembrandts","REM","Counting Crows","Hootie"], correct: 0 },
  { question: "Who is afraid of swings?", choices: ["Joey","Chandler","Phoebe","Ross"], correct: 1 },
  { question: "Janice's catchphrase is?", choices: ["Oh my GOD!","How rude!","As if!","Whatever!"], correct: 0 },
  { question: "Ross had how many divorces total?", choices: ["1","2","3","4"], correct: 2 },
  { question: "Who lives across the hall from Monica?", choices: ["Ross","Joey and Chandler","Phoebe","Susan"], correct: 1 },
  { question: "Friends ran for how many seasons?", choices: ["8","9","10","11"], correct: 2 },
  { question: "Final episode aired in?", choices: ["2002","2003","2004","2005"], correct: 2 },
  { question: "Joey's agent is named?", choices: ["Estelle","Pearl","Helen","Nancy"], correct: 0 },
  { question: "Who has a dollhouse fire incident?", choices: ["Phoebe","Monica","Rachel","Ursula"], correct: 0 },
  { question: "Ross's son is named?", choices: ["Ben","Bobby","Brian","Brett"], correct: 0 },
  { question: "Chandler and Monica get married in?", choices: ["Vegas","Atlantic City","New York","Bahamas"], correct: 2 },
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
