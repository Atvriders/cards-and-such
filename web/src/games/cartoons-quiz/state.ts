import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CartoonsQuizSettings { questions: "10" | "20" | "30"; }
export interface CartoonsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CartoonsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bugs Bunny's catchphrase?", choices: ["What's up, Doc?", "That's all folks", "Th-th-that's all folks", "Beep beep"], correct: 0 },
  { question: "Bugs Bunny's home studio?", choices: ["Disney", "Warner Bros", "MGM", "Hanna-Barbera"], correct: 1 },
  { question: "'Looney Tunes' famous closing line?", choices: ["What's up, Doc?", "That's all folks", "Beep beep", "Yabba dabba doo"], correct: 1 },
  { question: "Tom and Jerry are?", choices: ["Cat and mouse", "Dog and cat", "Mouse and bird", "Cat and bird"], correct: 0 },
  { question: "Wile E. Coyote's nemesis?", choices: ["Speedy Gonzales", "Road Runner", "Tweety", "Foghorn"], correct: 1 },
  { question: "'The Simpsons' creator?", choices: ["Matt Groening", "Seth MacFarlane", "Mike Judge", "Trey Parker"], correct: 0 },
  { question: "What city do The Simpsons live in?", choices: ["Springfield", "Quahog", "Pawnee", "South Park"], correct: 0 },
  { question: "How many fingers does Homer have on each hand?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Bart's catchphrase?", choices: ["D'oh!", "Eat my shorts", "Cowabunga", "Aye Carumba"], correct: 1 },
  { question: "Lisa Simpson plays which instrument?", choices: ["Piano", "Saxophone", "Guitar", "Trumpet"], correct: 1 },
  { question: "'Family Guy' creator?", choices: ["Matt Groening", "Seth MacFarlane", "Trey Parker", "Mike Judge"], correct: 1 },
  { question: "Family Guy family name?", choices: ["Griffin", "Simpson", "Smith", "Belcher"], correct: 0 },
  { question: "'South Park' creators?", choices: ["Trey Parker and Matt Stone", "Just Trey Parker", "Mike Judge", "Seth MacFarlane"], correct: 0 },
  { question: "Eric Cartman's catchphrase?", choices: ["Screw you guys, I'm going home", "Oh my god, they killed Kenny!", "You bastards!", "All of these"], correct: 3 },
  { question: "'SpongeBob SquarePants' lives in?", choices: ["Bikini Bottom", "Atlantis", "Coral Reef", "Deep Six"], correct: 0 },
  { question: "SpongeBob's pet is?", choices: ["Patrick", "Gary the snail", "Sandy the squirrel", "Squidward"], correct: 1 },
  { question: "'Rick and Morty' creators?", choices: ["Justin Roiland and Dan Harmon", "Matt Groening", "Mike Judge", "Trey Parker"], correct: 0 },
  { question: "Rick's catchphrase?", choices: ["Wubba lubba dub dub", "D'oh", "Bazinga", "Cowabunga"], correct: 0 },
  { question: "Yogi Bear's home park?", choices: ["Yellowstone", "Jellystone", "Yogiverse", "Pic-A-Nic"], correct: 1 },
  { question: "Fred Flintstone's catchphrase?", choices: ["Yabba dabba doo", "What's up doc", "D'oh", "Beep beep"], correct: 0 },
  { question: "Flintstones' studio?", choices: ["Hanna-Barbera", "Disney", "Warner Bros", "Pixar"], correct: 0 },
  { question: "George Jetson's son?", choices: ["Elroy", "Bart", "Stewie", "Bobby"], correct: 0 },
  { question: "Scooby-Doo's owner?", choices: ["Shaggy", "Fred", "Velma", "Daphne"], correct: 0 },
  { question: "Daffy Duck's color?", choices: ["Black", "White", "Brown", "Blue"], correct: 0 },
  { question: "Sylvester chases?", choices: ["Tweety", "Road Runner", "Bugs", "Daffy"], correct: 0 },
  { question: "'Dexter's Laboratory' is set in a?", choices: ["Lab", "Dungeon", "School", "Forest"], correct: 0 },
  { question: "'PowerPuff Girls' three names?", choices: ["Blossom Bubbles Buttercup", "Blossom Bubbles Sugar", "Sugar Spice Everything Nice", "Bloom Berry Buttercup"], correct: 0 },
  { question: "'Pinky and the Brain' want to?", choices: ["Take over the world", "Find cheese", "Escape lab", "Become friends"], correct: 0 },
  { question: "'Avatar: The Last Airbender' four nations?", choices: ["Water Earth Fire Air", "North South East West", "Spring Summer Fall Winter", "Wood Stone Metal Glass"], correct: 0 },
  { question: "Aang is the Avatar of which generation/cycle?", choices: ["Air Nomad", "Water Tribe", "Fire Nation", "Earth Kingdom"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CartoonsQuizSettings): CartoonsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CartoonsQuizState, action: CartoonsQuizAction): CartoonsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CartoonsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
