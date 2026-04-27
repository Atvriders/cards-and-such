import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SimpsonsSettings { questions: "10" | "20" | "30"; }
export interface SimpsonsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SimpsonsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Springfield's family of 5?", choices: ["The Simpsons","The Flanders","The Burns","The Wiggums"], correct: 0 },
  { question: "Homer's catchphrase?", choices: ["D'oh!","Aye carumba","Excellent","Eat my shorts"], correct: 0 },
  { question: "Bart's catchphrase?", choices: ["Eat my shorts","D'oh","Cowabunga","Both 1 & 3"], correct: 3 },
  { question: "Homer's boss?", choices: ["Mr. Burns","Lenny","Carl","Smithers"], correct: 0 },
  { question: "Lisa plays what instrument?", choices: ["Saxophone","Guitar","Drums","Piano"], correct: 0 },
  { question: "Marge's iconic feature?", choices: ["Blue hair","Red hair","Long arms","Tall hat"], correct: 0 },
  { question: "Maggie's pacifier sound?", choices: ["Suck","Pop","Beep","Click"], correct: 0 },
  { question: "Apu owns the?", choices: ["Kwik-E-Mart","Quik Stop","Mini Mart","7-Eleven"], correct: 0 },
  { question: "Bart's bus driver?", choices: ["Otto","Skinner","Willie","Karl"], correct: 0 },
  { question: "Krusty's name?", choices: ["Herschel Krustofski","Jeff Krusty","Bob Krusty","Mort"], correct: 0 },
  { question: "Springfield's bar?", choices: ["Moe's Tavern","Cheers","Sam's","The Booze"], correct: 0 },
  { question: "Mayor's name?", choices: ["Quimby","Giuliani","Daley","Mayor"], correct: 0 },
  { question: "Show created by?", choices: ["Matt Groening","Seth MacFarlane","Trey Parker","Mike Judge"], correct: 0 },
  { question: "Homer's job is?", choices: ["Safety inspector","Welder","Manager","Engineer"], correct: 0 },
  { question: "Itchy and Scratchy parodies?", choices: ["Tom and Jerry","Tweety","Roadrunner","Looney Tunes"], correct: 0 },
  { question: "Treehouse of Horror airs at?", choices: ["Halloween","Christmas","Easter","Thanksgiving"], correct: 0 },
  { question: "Mr. Burns's assistant?", choices: ["Smithers","Carl","Lenny","Jasper"], correct: 0 },
  { question: "Ned Flanders' catchphrase?", choices: ["Hi-diddly-ho","What up","Yo","Hello"], correct: 0 },
  { question: "Comic Book Guy says?", choices: ["Worst. Episode. Ever.","D'oh","Hi","Bye"], correct: 0 },
  { question: "Show first aired in?", choices: ["1989","1991","1993","1985"], correct: 0 },
  { question: "Simpsons family pet dog?", choices: ["Santa's Little Helper","Rex","Spot","Buddy"], correct: 0 },
  { question: "Family cat is?", choices: ["Snowball II","Tabby","Tiger","Whiskers"], correct: 0 },
  { question: "Sideshow Bob's number?", choices: ["24601","Various","0","555"], correct: 0 },
  { question: "Springfield Elementary principal?", choices: ["Skinner","Krabappel","Hoover","Chalmers"], correct: 0 },
  { question: "Lisa's age?", choices: ["7","8","9","10"], correct: 1 },
  { question: "Bart's age?", choices: ["8","9","10","11"], correct: 2 },
  { question: "Lyle Lanley sells?", choices: ["Monorail","Bus","Cars","Magic"], correct: 0 },
  { question: "Steamed Hams is?", choices: ["A meme/episode","Movie","Book","Song"], correct: 0 },
  { question: "Spider-Pig featured in?", choices: ["The Movie","Show","Game","Book"], correct: 0 },
  { question: "Homer's middle name?", choices: ["Jay","Paul","Lee","Tom"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SimpsonsSettings): SimpsonsState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SimpsonsState, action: SimpsonsAction): SimpsonsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SimpsonsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
