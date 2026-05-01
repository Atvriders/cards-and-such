import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DragonballQuizSettings { questions: "10" | "20"; }
export interface DragonballQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DragonballQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Goku's Saiyan birth name is?", choices: ["Kakarot", "Bardock", "Raditz", "Vegeta"], correct: 0 },
  { question: "Goku's home planet of origin?", choices: ["Namek", "Earth", "Vegeta", "Yardrat"], correct: 2 },
  { question: "How many Dragon Balls must be gathered?", choices: ["5", "6", "7", "8"], correct: 2 },
  { question: "Who is the Eternal Dragon of Earth?", choices: ["Porunga", "Shenron", "Zalama", "Super Shenron"], correct: 1 },
  { question: "Goku's signature attack?", choices: ["Galick Gun", "Kamehameha", "Final Flash", "Special Beam Cannon"], correct: 1 },
  { question: "Who first taught Goku the Kamehameha?", choices: ["Master Roshi", "Korin", "King Kai", "Grandpa Gohan"], correct: 0 },
  { question: "Vegeta's signature finishing move?", choices: ["Kamehameha", "Galick Gun", "Spirit Bomb", "Kaio-ken"], correct: 1 },
  { question: "Piccolo is from which planet?", choices: ["Namek", "Earth", "Vegeta", "Yardrat"], correct: 0 },
  { question: "Frieza's final form has what tail color?", choices: ["Pure white", "Purple", "Black", "Gold"], correct: 0 },
  { question: "Cell's androids absorbed are?", choices: ["16 and 17", "17 and 18", "18 and 19", "19 and 20"], correct: 1 },
  { question: "Who first achieved Super Saiyan in DBZ?", choices: ["Vegeta", "Goku", "Gohan", "Trunks"], correct: 1 },
  { question: "Trunks's mother is?", choices: ["Bulma", "Chi-Chi", "Videl", "Launch"], correct: 0 },
  { question: "Gohan's wife is?", choices: ["Videl", "Bulma", "Chi-Chi", "Pan"], correct: 0 },
  { question: "Krillin's nose feature?", choices: ["Pointy nose", "No visible nose", "Long nose", "Hooked nose"], correct: 1 },
  { question: "Buu's first form was called?", choices: ["Kid Buu", "Fat (Innocent) Buu", "Super Buu", "Evil Buu"], correct: 1 },
  { question: "What technique lets Goku teleport?", choices: ["Kaio-ken", "Instant Transmission", "Spirit Bomb", "Solar Flare"], correct: 1 },
  { question: "Goku trained on King Kai's planet with what gravity?", choices: ["10x Earth", "20x Earth", "100x Earth", "1000x Earth"], correct: 0 },
  { question: "Cell achieves perfection by absorbing?", choices: ["Android 16", "Android 17", "Android 18", "Android 19"], correct: 2 },
  { question: "Goten's father is?", choices: ["Goku", "Vegeta", "Piccolo", "Krillin"], correct: 0 },
  { question: "The fusion of Goten and Trunks is?", choices: ["Gogeta", "Vegito", "Gotenks", "Tiencha"], correct: 2 },
  { question: "Who was the first villain in Dragon Ball?", choices: ["Pilaf", "Frieza", "Cell", "Buu"], correct: 0 },
  { question: "Master Roshi's island home has what tree?", choices: ["Palm", "Pine", "Bamboo", "Oak"], correct: 0 },
  { question: "Saiyan tails grant which transformation?", choices: ["Super Saiyan", "Great Ape (Oozaru)", "Ultra Instinct", "Super Saiyan God"], correct: 1 },
  { question: "Beerus is the God of?", choices: ["Creation", "Destruction", "Dragons", "Time"], correct: 1 },
  { question: "Whis is the attendant/teacher of?", choices: ["Goku", "Beerus", "Zeno", "Champa"], correct: 1 },
  { question: "Goku's eldest son is?", choices: ["Goten", "Gohan", "Trunks", "Pan"], correct: 1 },
  { question: "What turns Goku's hair red?", choices: ["Super Saiyan Blue", "Super Saiyan God", "Ultra Instinct", "Kaio-ken"], correct: 1 },
  { question: "Who pilots the time machine to warn the Z fighters?", choices: ["Future Trunks", "Future Gohan", "Future Bulma", "Future Vegeta"], correct: 0 },
  { question: "Frieza's final-form power level on Namek?", choices: ["120 million", "60 million", "1 million", "9000"], correct: 0 },
  { question: "Who killed King Piccolo?", choices: ["Goku", "Tien", "Krillin", "Yamcha"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DragonballQuizSettings): DragonballQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DragonballQuizState, action: DragonballQuizAction): DragonballQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DragonballQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
