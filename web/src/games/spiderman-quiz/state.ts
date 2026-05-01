import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpidermanQuizSettings { questions: "10" | "20"; }
export interface SpidermanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpidermanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spider-Man's secret identity?", choices: ["Peter Parker", "Miles Morales", "Ben Reilly", "Otto Octavius"], correct: 0 },
  { question: "How did Peter get his powers?", choices: ["Radioactive spider bite", "Cosmic rays", "Mutation", "Lab serum"], correct: 0 },
  { question: "Peter's uncle (killed early on)?", choices: ["Uncle Ben", "Uncle Phil", "Uncle Henry", "Uncle Cliff"], correct: 0 },
  { question: "Peter's aunt's name?", choices: ["May", "Petunia", "Anna", "Janice"], correct: 0 },
  { question: "Peter's red-haired love interest?", choices: ["Mary Jane Watson", "Gwen Stacy", "Felicia Hardy", "Black Cat"], correct: 0 },
  { question: "The blonde girlfriend Norman killed?", choices: ["Gwen Stacy", "Mary Jane", "Felicia Hardy", "Liz Allan"], correct: 0 },
  { question: "Spider-Man first appeared in?", choices: ["Amazing Fantasy #15 (1962)", "Amazing Spider-Man #1", "Marvel Tales #1", "Strange Tales #1"], correct: 0 },
  { question: "Spider-Man's creators?", choices: ["Stan Lee and Steve Ditko", "Lee and Kirby", "Lee and Buscema", "Bendis and Bagley"], correct: 0 },
  { question: "The Daily Bugle's editor is?", choices: ["J. Jonah Jameson", "Robbie Robertson", "Ben Urich", "Joe Robertson"], correct: 0 },
  { question: "Doctor Octopus's real name?", choices: ["Otto Octavius", "Norman Osborn", "Curt Connors", "Max Dillon"], correct: 0 },
  { question: "Green Goblin's identity?", choices: ["Norman Osborn", "Harry Osborn", "Otto Octavius", "Cletus Kasady"], correct: 0 },
  { question: "Venom's first host?", choices: ["Eddie Brock", "Peter Parker", "Cletus Kasady", "Mac Gargan"], correct: 0 },
  { question: "Venom is a what?", choices: ["Symbiote", "Mutant", "Mutate", "Magic creature"], correct: 0 },
  { question: "Carnage's host?", choices: ["Cletus Kasady", "Eddie Brock", "Peter Parker", "Norman Osborn"], correct: 0 },
  { question: "The Lizard's real name?", choices: ["Curt Connors", "Otto Octavius", "Aleksei Sytsevich", "Sergei Kravinoff"], correct: 0 },
  { question: "Kraven the Hunter's real name?", choices: ["Sergei Kravinoff", "Aleksei Sytsevich", "Norman Osborn", "Otto Octavius"], correct: 0 },
  { question: "Mysterio's signature?", choices: ["Special effects/illusions", "Strength", "Magic", "Tech armor"], correct: 0 },
  { question: "Electro's real name?", choices: ["Max Dillon", "Cletus Kasady", "Mac Gargan", "Quentin Beck"], correct: 0 },
  { question: "Sandman's real name?", choices: ["Flint Marko", "Max Dillon", "Aleksei Sytsevich", "Otto Octavius"], correct: 0 },
  { question: "Rhino's real name?", choices: ["Aleksei Sytsevich", "Max Dillon", "Mac Gargan", "Cletus Kasady"], correct: 0 },
  { question: "Spider-Man's iconic creed?", choices: ["With great power comes great responsibility", "Avengers Assemble", "It's clobberin' time", "Hulk smash"], correct: 0 },
  { question: "Miles Morales's mentor?", choices: ["Peter Parker (mostly)", "Tony Stark", "Stephen Strange", "Steve Rogers"], correct: 0 },
  { question: "Spider-Gwen's universe Earth-?", choices: ["Earth-65", "Earth-616", "Earth-1610", "Earth-92131"], correct: 0 },
  { question: "Web-shooters Peter built use?", choices: ["Mechanical shooters with web fluid", "Magic", "Solar panels", "Fingertip pores only (movie 2002)"], correct: 0 },
  { question: "Black Cat's real name?", choices: ["Felicia Hardy", "Mary Jane", "Gwen Stacy", "Liz Allan"], correct: 0 },
  { question: "Spider-Man's high school?", choices: ["Midtown High", "Forest Hills", "Empire State", "Xavier's"], correct: 0 },
  { question: "Peter's college?", choices: ["Empire State University", "ESU = Empire State University", "Columbia", "NYU"], correct: 0 },
  { question: "Hobgoblin (original)?", choices: ["Roderick Kingsley", "Norman Osborn", "Harry Osborn", "Phil Urich"], correct: 0 },
  { question: "Scorpion's real name?", choices: ["Mac Gargan", "Max Dillon", "Otto Octavius", "Cletus Kasady"], correct: 0 },
  { question: "Spider-Man's home borough?", choices: ["Queens", "Manhattan", "Brooklyn", "Bronx"], correct: 0 },
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
