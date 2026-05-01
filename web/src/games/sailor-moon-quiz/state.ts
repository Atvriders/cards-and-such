import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SailorMoonQuizSettings { questions: "10" | "20"; }
export interface SailorMoonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SailorMoonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sailor Moon's civilian name?", choices: ["Usagi Tsukino", "Ami Mizuno", "Rei Hino", "Makoto Kino"], correct: 0 },
  { question: "Sailor Mercury's civilian name?", choices: ["Usagi", "Ami Mizuno", "Rei", "Minako"], correct: 1 },
  { question: "Sailor Mars's civilian name?", choices: ["Rei Hino", "Ami", "Usagi", "Makoto"], correct: 0 },
  { question: "Sailor Jupiter's civilian name?", choices: ["Makoto Kino", "Minako", "Ami", "Rei"], correct: 0 },
  { question: "Sailor Venus's civilian name?", choices: ["Minako Aino", "Rei", "Ami", "Makoto"], correct: 0 },
  { question: "Tuxedo Mask's identity is?", choices: ["Mamoru Chiba", "Motoki", "Kunzite", "Diamond"], correct: 0 },
  { question: "Usagi's talking cat is?", choices: ["Luna", "Artemis", "Diana", "Mau"], correct: 0 },
  { question: "Minako's cat companion?", choices: ["Luna", "Artemis", "Diana", "Sebastian"], correct: 1 },
  { question: "Sailor Moon's daughter (from the future)?", choices: ["Chibiusa", "Hotaru", "Diana", "Setsuna"], correct: 0 },
  { question: "Sailor Saturn's civilian name?", choices: ["Hotaru Tomoe", "Setsuna", "Haruka", "Michiru"], correct: 0 },
  { question: "Sailor Uranus's civilian name?", choices: ["Haruka Tenoh", "Michiru", "Setsuna", "Hotaru"], correct: 0 },
  { question: "Sailor Neptune's civilian name?", choices: ["Michiru Kaioh", "Haruka", "Hotaru", "Setsuna"], correct: 0 },
  { question: "Sailor Pluto's civilian name?", choices: ["Setsuna Meioh", "Haruka", "Michiru", "Hotaru"], correct: 0 },
  { question: "The villain queen in season 1 is?", choices: ["Queen Beryl", "Mistress 9", "Galaxia", "Wiseman"], correct: 0 },
  { question: "The crystal Sailor Moon wields?", choices: ["Silver Crystal", "Garnet Orb", "Space Sword", "Aqua Mirror"], correct: 0 },
  { question: "Usagi is reincarnated princess of?", choices: ["The Moon Kingdom", "Crystal Tokyo", "Earth", "Venus"], correct: 0 },
  { question: "The series creator is?", choices: ["Naoko Takeuchi", "Rumiko Takahashi", "CLAMP", "Yoshiyuki Sadamoto"], correct: 0 },
  { question: "Sailor Mercury's element-themed attack uses?", choices: ["Water/Ice", "Fire", "Lightning", "Wind"], correct: 0 },
  { question: "Sailor Mars uses?", choices: ["Fire", "Water", "Ice", "Wind"], correct: 0 },
  { question: "Sailor Jupiter wields?", choices: ["Lightning", "Vines", "Ice", "Sound"], correct: 0 },
  { question: "Sailor Venus's signature attack throws a?", choices: ["Crescent Beam / Love-Me Chain", "Tiara", "Ice Bubble", "Fire Soul"], correct: 0 },
  { question: "Crystal Tokyo is the future capital ruled by?", choices: ["Neo-Queen Serenity", "Queen Beryl", "Sailor Galaxia", "Wiseman"], correct: 0 },
  { question: "The Black Moon Clan attacks in which arc?", choices: ["R (Black Moon)", "S", "SuperS", "Stars"], correct: 0 },
  { question: "Mistress 9 possesses whom?", choices: ["Hotaru Tomoe", "Chibiusa", "Usagi", "Rei"], correct: 0 },
  { question: "Sailor Galaxia is the villain of?", choices: ["Stars", "R", "S", "SuperS"], correct: 0 },
  { question: "The animated series first aired in?", choices: ["1992", "1995", "1998", "2000"], correct: 0 },
  { question: "Helios appears as a winged?", choices: ["Pegasus/Unicorn", "Phoenix", "Eagle", "Owl"], correct: 0 },
  { question: "Sailor Senshi are also called?", choices: ["Sailor Scouts (English)", "Magical Girls", "Star Fleet", "Battle Maidens"], correct: 0 },
  { question: "Usagi's catchphrase often involves the word?", choices: ["Moon", "Stars", "Sun", "Wind"], correct: 0 },
  { question: "Sailor Moon's tiara is thrown as a?", choices: ["Frisbee weapon (Moon Tiara Action)", "Shield", "Magic carpet", "Boomerang sword"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SailorMoonQuizSettings): SailorMoonQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SailorMoonQuizState, action: SailorMoonQuizAction): SailorMoonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SailorMoonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
