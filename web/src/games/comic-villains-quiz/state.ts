import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComicVillainsQuizSettings { questions: "10" | "20"; }
export interface ComicVillainsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComicVillainsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Thanos's home moon?", choices: ["Titan", "Saturn", "Earth", "Sakaar"], correct: 0 },
  { question: "Doctor Doom rules?", choices: ["Latveria", "Wakanda", "Atlantis", "Genosha"], correct: 0 },
  { question: "Galactus eats?", choices: ["Planets", "Stars", "Souls", "Ships"], correct: 0 },
  { question: "Loki's home realm?", choices: ["Asgard (Jotunheim origin)", "Hel", "Vanaheim", "Earth"], correct: 0 },
  { question: "Joker's first comic?", choices: ["Batman #1", "Detective Comics #27", "Action Comics #1", "Joker #1"], correct: 0 },
  { question: "Lex Luthor's company?", choices: ["LexCorp", "Wayne Tech", "Stark", "Oscorp"], correct: 0 },
  { question: "Darkseid's home planet?", choices: ["Apokolips", "New Genesis", "Krypton", "Oa"], correct: 0 },
  { question: "Magneto's helmet blocks?", choices: ["Telepathy", "Bullets", "Lightning", "Nothing"], correct: 0 },
  { question: "Red Skull's real name?", choices: ["Johann Schmidt", "Helmut Zemo", "Klaw", "Ulysses Klaw"], correct: 0 },
  { question: "Norman Osborn's alter ego?", choices: ["Green Goblin", "Hobgoblin", "Venom", "Carnage"], correct: 0 },
  { question: "Carnage's symbiote color?", choices: ["Red", "Black", "White", "Green"], correct: 0 },
  { question: "Venom's symbiote color?", choices: ["Black", "Red", "White", "Yellow"], correct: 0 },
  { question: "Sinestro is opposite of?", choices: ["Hal Jordan", "Barry Allen", "Bruce Wayne", "Diana Prince"], correct: 0 },
  { question: "Brainiac is from?", choices: ["Colu", "Krypton", "Mars", "Earth"], correct: 0 },
  { question: "Mister Sinister specializes in?", choices: ["Genetics", "Magic", "Tech", "Cosmic"], correct: 0 },
  { question: "Kingpin's name?", choices: ["Wilson Fisk", "Norman Osborn", "Lex Luthor", "Otto Octavius"], correct: 0 },
  { question: "Bullseye's specialty?", choices: ["Throwing weapons", "Mind reading", "Strength", "Healing"], correct: 0 },
  { question: "Ultron created by?", choices: ["Hank Pym", "Tony Stark", "Reed Richards", "Charles Xavier"], correct: 0 },
  { question: "Mephisto rules?", choices: ["Hell-like dimension", "Asgard", "Krypton", "Earth"], correct: 0 },
  { question: "Dormammu rules?", choices: ["Dark Dimension", "Asgard", "Hell", "Earth"], correct: 0 },
  { question: "Black Adam's origin?", choices: ["Ancient Kahndaq", "Krypton", "Mars", "Atlantis"], correct: 0 },
  { question: "Cheetah's foe?", choices: ["Wonder Woman", "Superman", "Batman", "Flash"], correct: 0 },
  { question: "Two-Face's coin has?", choices: ["Two heads (one scarred)", "Heads/tails normal", "Eagle/dragon", "Faces of family"], correct: 0 },
  { question: "Apocalypse's catchphrase?", choices: ["Survival of the fittest", "All for none", "Mutant pride", "Chaos forever"], correct: 0 },
  { question: "Doomsday famously did what to Superman?", choices: ["Killed him (1992)", "Tied him up", "Trapped him in Phantom Zone", "Stole powers"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComicVillainsQuizSettings): ComicVillainsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComicVillainsQuizState, action: ComicVillainsQuizAction): ComicVillainsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComicVillainsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
