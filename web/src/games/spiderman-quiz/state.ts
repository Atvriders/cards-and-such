import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpidermanQuizSettings { questions: "10" | "20"; }
export interface SpidermanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpidermanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spider-Man's true identity?", choices: ["Peter Parker", "Miles Morales", "Ben Reilly", "Otto Octavius"], correct: 0 },
  { question: "Peter's aunt who raised him?", choices: ["Aunt May", "Aunt Carol", "Aunt Anna", "Aunt Jan"], correct: 0 },
  { question: "Peter's uncle's last words effect?", choices: ["With great power...", "I am Iron Man", "Avengers Assemble", "Hulk smash"], correct: 0 },
  { question: "Newspaper Peter shoots for?", choices: ["Daily Bugle", "Daily Planet", "Daily News", "Daily Globe"], correct: 0 },
  { question: "Editor at the Bugle?", choices: ["J. Jonah Jameson", "Perry White", "Robbie Robertson", "Ben Urich"], correct: 0 },
  { question: "Peter's first love (died)?", choices: ["Gwen Stacy", "Mary Jane", "Felicia Hardy", "Liz Allan"], correct: 0 },
  { question: "Peter's red-headed wife?", choices: ["Mary Jane Watson", "Gwen Stacy", "Felicia Hardy", "Betty Brant"], correct: 0 },
  { question: "Spider bite was?", choices: ["Radioactive", "Genetically engineered", "Cosmic", "Magic"], correct: 0 },
  { question: "Green Goblin's real name (original)?", choices: ["Norman Osborn", "Harry Osborn", "Otto Octavius", "Cletus Kasady"], correct: 0 },
  { question: "Harry Osborn became?", choices: ["Hobgoblin", "Green Goblin II", "Venom", "Carnage"], correct: 1 },
  { question: "Doc Ock's real name?", choices: ["Otto Octavius", "Adrian Toomes", "Curt Connors", "Sergei Kravinoff"], correct: 0 },
  { question: "Vulture's name?", choices: ["Adrian Toomes", "Otto Octavius", "Quentin Beck", "Mac Gargan"], correct: 0 },
  { question: "Lizard's human name?", choices: ["Curt Connors", "Eddie Brock", "Felicia Hardy", "Cletus Kasady"], correct: 0 },
  { question: "Mysterio's real name?", choices: ["Quentin Beck", "Max Dillon", "Sergei Kravinoff", "Norman Osborn"], correct: 0 },
  { question: "Electro's real name?", choices: ["Max Dillon", "Quentin Beck", "Adrian Toomes", "Otto Octavius"], correct: 0 },
  { question: "Kraven's first name?", choices: ["Sergei", "Vladimir", "Boris", "Anton"], correct: 0 },
  { question: "Sandman's real name?", choices: ["Flint Marko", "William Baker", "Both same person", "Adrian Toomes"], correct: 2 },
  { question: "Venom symbiote bonded with?", choices: ["Eddie Brock", "Cletus Kasady", "Peter Parker first", "All of these"], correct: 3 },
  { question: "Carnage's host?", choices: ["Cletus Kasady", "Eddie Brock", "Mac Gargan", "Flash Thompson"], correct: 0 },
  { question: "Spider-Man's spider-sense alerts to?", choices: ["Danger", "Lies", "Heat", "Sound"], correct: 0 },
  { question: "Web-shooters are made by?", choices: ["Peter himself", "Stark", "Doc Ock", "Iron Man"], correct: 0 },
  { question: "Miles Morales is from which Marvel reality?", choices: ["Ultimate then mainstream", "MCU only", "X-Men line", "Excelsior line"], correct: 0 },
  { question: "Spider-Man first appeared?", choices: ["Amazing Fantasy #15", "Spider-Man #1", "Daily Bugle Issue 1", "Marvel Comics Presents"], correct: 0 },
  { question: "Spider-Man first issue year?", choices: ["1962", "1965", "1959", "1967"], correct: 0 },
  { question: "Spider-Man's creator?", choices: ["Stan Lee and Steve Ditko", "Bob Kane", "Jack Kirby alone", "Stan Lee alone"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpidermanQuizSettings): SpidermanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpidermanQuizState, action: SpidermanQuizAction): SpidermanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpidermanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
