import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HalloweenQuizSettings { questions: "10" | "20" | "30"; }
export interface HalloweenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HalloweenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Halloween's date is?", choices: ["October 31", "October 30", "November 1", "October 25"], correct: 0 },
  { question: "Halloween originated from which Celtic festival?", choices: ["Samhain", "Beltane", "Imbolc", "Lughnasadh"], correct: 0 },
  { question: "What does 'Halloween' shorten?", choices: ["All Hallows' Eve", "Hallow's evening", "Halloween mass", "All Souls' eve"], correct: 0 },
  { question: "What is November 1 called?", choices: ["All Saints' Day", "All Souls' Day", "Day of the Dead", "St. Nicholas Day"], correct: 0 },
  { question: "What is November 2 called?", choices: ["All Souls' Day", "All Saints' Day", "Day of the Dead Eve", "Saints Plus"], correct: 0 },
  { question: "Mexico's Day of the Dead is celebrated?", choices: ["November 1-2", "October 31", "December 12", "November 25"], correct: 0 },
  { question: "Mexico's Day of the Dead is called?", choices: ["Día de los Muertos", "Cinco de Mayo", "Las Posadas", "Día de la Raza"], correct: 0 },
  { question: "Jack-o'-lanterns originated in carving what?", choices: ["Turnips (Ireland)", "Pumpkins from start", "Watermelons", "Apples"], correct: 0 },
  { question: "Why are pumpkins used now?", choices: ["Native to North America, easier to carve", "Required by law", "Symbolic of corn", "Cheaper than turnips"], correct: 0 },
  { question: "Trick-or-treating originated from which European custom?", choices: ["Souling/guising", "May Day dancing", "Christmas caroling alone", "Easter parade"], correct: 0 },
  { question: "What classic monster comes from Bram Stoker (1897)?", choices: ["Dracula", "Frankenstein", "Werewolf", "Mummy"], correct: 0 },
  { question: "Frankenstein was written by?", choices: ["Mary Shelley", "Bram Stoker", "Edgar Allan Poe", "H.G. Wells"], correct: 0 },
  { question: "Frankenstein was published in?", choices: ["1818", "1897", "1850", "1900"], correct: 0 },
  { question: "Who plays Dracula in the iconic 1931 film?", choices: ["Bela Lugosi", "Boris Karloff", "Lon Chaney Jr.", "Christopher Lee"], correct: 0 },
  { question: "Boris Karloff played which classic monster (1931)?", choices: ["Frankenstein's Monster", "Dracula", "Mummy", "Wolf Man"], correct: 0 },
  { question: "John Carpenter's 1978 horror is?", choices: ["Halloween", "The Thing", "Friday the 13th", "Nightmare on Elm Street"], correct: 0 },
  { question: "Who is the killer in 'Halloween'?", choices: ["Michael Myers", "Jason Voorhees", "Freddy Krueger", "Leatherface"], correct: 0 },
  { question: "Jason Voorhees is from which franchise?", choices: ["Friday the 13th", "Halloween", "Nightmare on Elm Street", "Texas Chainsaw"], correct: 0 },
  { question: "Freddy Krueger is from?", choices: ["A Nightmare on Elm Street", "Friday the 13th", "Halloween", "Saw"], correct: 0 },
  { question: "What 1993 Tim Burton stop-motion film?", choices: ["The Nightmare Before Christmas", "Coraline", "Corpse Bride", "Frankenweenie"], correct: 0 },
  { question: "Most-watched modern Halloween candy?", choices: ["Reese's, Snickers, Skittles, candy corn typical", "Just lollipops", "Just chocolate bars", "Just gum"], correct: 0 },
  { question: "Candy corn was invented in?", choices: ["1880s", "1950s", "1900s", "1920s"], correct: 0 },
  { question: "What Salem MA event is associated with Halloween tourism?", choices: ["Salem witch trials of 1692", "Salem fire", "Battle of Salem", "Salem founding"], correct: 0 },
  { question: "What is 'mischief night'?", choices: ["Night before Halloween (pranks)", "Halloween itself", "Boxing Day", "Mardi Gras"], correct: 0 },
  { question: "What is the origin of black cats and witches association?", choices: ["Medieval European folklore (cats as familiars)", "American invention", "Ancient Egypt", "Native American belief"], correct: 0 },
  { question: "What Charles Schulz Halloween special features Linus?", choices: ["It's the Great Pumpkin, Charlie Brown", "A Charlie Brown Halloween", "Snoopy's Halloween", "Pumpkin Patch"], correct: 0 },
  { question: "What Hocus Pocus year?", choices: ["1993", "1995", "1990", "2000"], correct: 0 },
  { question: "Who plays the Sanderson sisters in Hocus Pocus?", choices: ["Bette Midler, Sarah Jessica Parker, Kathy Najimy", "Bette Midler alone", "Just SJP", "Mary Steenburgen-led"], correct: 0 },
  { question: "Halloween Horror Nights is held at?", choices: ["Universal Studios", "Disney", "Six Flags", "Cedar Point"], correct: 0 },
  { question: "Pumpkin spice is a blend of?", choices: ["Cinnamon, nutmeg, ginger, cloves", "Just cinnamon", "Pumpkin pulp", "Anise and cardamom"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HalloweenQuizSettings): HalloweenQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HalloweenQuizState, action: HalloweenQuizAction): HalloweenQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HalloweenQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
