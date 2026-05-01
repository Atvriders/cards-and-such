import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComicVillainsQuizSettings { questions: "10" | "20"; }
export interface ComicVillainsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComicVillainsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Thanos's home moon?", choices: ["Titan", "Saturn", "Earth", "Sakaar"], correct: 0 },
  { question: "Doctor Doom rules?", choices: ["Latveria", "Wakanda", "Atlantis", "Genosha"], correct: 0 },
  { question: "Galactus consumes?", choices: ["Planets", "Stars", "Souls", "Ships"], correct: 0 },
  { question: "Loki's adoptive home realm?", choices: ["Asgard", "Hel", "Vanaheim", "Earth"], correct: 0 },
  { question: "Magneto's mutant power?", choices: ["Magnetism", "Telepathy", "Speed", "Phasing"], correct: 0 },
  { question: "The Joker's archenemy?", choices: ["Batman", "Superman", "Flash", "Aquaman"], correct: 0 },
  { question: "Lex Luthor's archenemy?", choices: ["Superman", "Batman", "Wonder Woman", "Flash"], correct: 0 },
  { question: "Darkseid rules?", choices: ["Apokolips", "New Genesis", "Oa", "Rann"], correct: 0 },
  { question: "Darkseid's omega energy comes from his?", choices: ["Eyes (Omega Beams)", "Hands", "Crown", "Throne"], correct: 0 },
  { question: "Red Skull is the foe of?", choices: ["Captain America", "Iron Man", "Thor", "Hulk"], correct: 0 },
  { question: "Green Goblin's real name?", choices: ["Norman Osborn", "Otto Octavius", "Cletus Kasady", "Wilson Fisk"], correct: 0 },
  { question: "Kingpin's real name?", choices: ["Wilson Fisk", "Norman Osborn", "Aleksei Sytsevich", "Sergei Kravinoff"], correct: 0 },
  { question: "Carnage's host is?", choices: ["Cletus Kasady", "Eddie Brock", "Mac Gargan", "Flash Thompson"], correct: 0 },
  { question: "Venom's symbiote is from?", choices: ["Klyntar (alien race)", "Earth lab", "Chitauri ship", "Wakanda"], correct: 0 },
  { question: "Ultron was created by?", choices: ["Hank Pym (Ant-Man)", "Tony Stark (MCU)", "Reed Richards", "Charles Xavier"], correct: 0 },
  { question: "MCU's Thanos seeks?", choices: ["Infinity Stones", "Tesseract only", "Mjolnir", "Pym Particles"], correct: 0 },
  { question: "How many Infinity Stones?", choices: ["6", "5", "7", "9"], correct: 0 },
  { question: "Reverse-Flash is the foe of?", choices: ["The Flash", "Green Lantern", "Aquaman", "Cyborg"], correct: 0 },
  { question: "Sinestro is the foe of?", choices: ["Green Lantern", "Flash", "Aquaman", "Wonder Woman"], correct: 0 },
  { question: "Doomsday famously?", choices: ["Killed Superman (1992)", "Killed Robin", "Killed Captain America", "Killed Spider-Man"], correct: 0 },
  { question: "Bane is famously known for?", choices: ["Breaking Batman's back", "Killing Robin", "Robbing Gotham bank", "Mind control"], correct: 0 },
  { question: "Two-Face flips a?", choices: ["Coin", "Knife", "Card", "Die"], correct: 0 },
  { question: "Brainiac collects?", choices: ["Cities (in bottles)", "Stars", "Souls", "Magic items"], correct: 0 },
  { question: "The Mandarin wields?", choices: ["Ten Rings", "A hammer", "Mystic helmet", "A staff"], correct: 0 },
  { question: "Dormammu rules the?", choices: ["Dark Dimension", "Phantom Zone", "Hell", "Limbo"], correct: 0 },
  { question: "Apocalypse believes in?", choices: ["Survival of the fittest", "Peace and love", "Equal rights", "Time travel only"], correct: 0 },
  { question: "Mister Sinister wants?", choices: ["Perfect mutant genetics (Summers/Grey)", "Money", "Real estate", "Fame"], correct: 0 },
  { question: "Black Adam is from?", choices: ["Kahndaq", "Latveria", "Wakanda", "Atlantis"], correct: 0 },
  { question: "Galactus's heralds include?", choices: ["Silver Surfer", "Spider-Man", "Wolverine", "Daredevil"], correct: 0 },
  { question: "Mephisto rules?", choices: ["A hell-like dimension", "Asgard", "Latveria", "The Negative Zone"], correct: 0 },
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
