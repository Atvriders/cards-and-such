import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChineseNewYearQuizSettings { questions: "10" | "20" | "30"; }
export interface ChineseNewYearQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChineseNewYearQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chinese New Year is also called?", choices: ["Lunar New Year / Spring Festival", "Mid-Autumn Festival", "Dragon Boat Festival", "Qixi"], correct: 0 },
  { question: "Chinese New Year typically falls between?", choices: ["January 21 and February 20", "January 1 always", "February 14 always", "March equinox"], correct: 0 },
  { question: "Chinese New Year follows?", choices: ["Lunisolar calendar (new moon)", "Solar calendar", "Pure lunar calendar", "Roman calendar"], correct: 0 },
  { question: "How many animals are in the Chinese zodiac?", choices: ["12", "10", "8", "15"], correct: 0 },
  { question: "What is the first animal in the Chinese zodiac?", choices: ["Rat", "Ox", "Tiger", "Dragon"], correct: 0 },
  { question: "What zodiac year is 2024?", choices: ["Dragon", "Rabbit", "Snake", "Tiger"], correct: 0 },
  { question: "What zodiac year is 2025?", choices: ["Snake", "Dragon", "Horse", "Tiger"], correct: 0 },
  { question: "Chinese New Year celebrations last?", choices: ["15 days (until Lantern Festival)", "1 day", "3 days", "30 days"], correct: 0 },
  { question: "The 15th day of CNY is?", choices: ["Lantern Festival (Yuan Xiao Jie)", "Dragon Boat", "Mid-Autumn", "Qingming"], correct: 0 },
  { question: "Red envelopes are called?", choices: ["Hongbao", "Qipao", "Mahjong", "Fu"], correct: 0 },
  { question: "What is in red envelopes?", choices: ["Money (lucky money)", "Chocolates", "Notes", "Charms only"], correct: 0 },
  { question: "Red is associated with?", choices: ["Good fortune and warding off evil (Nian)", "Sadness", "Mourning", "Royalty only"], correct: 0 },
  { question: "Nian is?", choices: ["A mythical beast scared by red and noise", "A god", "A king", "A founder"], correct: 0 },
  { question: "Firecrackers serve to?", choices: ["Scare away evil spirits / Nian", "Just for noise", "Decorate", "Cook food"], correct: 0 },
  { question: "Reunion dinner is held on?", choices: ["New Year's Eve", "First day", "Last day (Lantern)", "Second day"], correct: 0 },
  { question: "Common reunion dinner dish symbolizing surplus?", choices: ["Fish (yu sounds like surplus)", "Beef", "Lamb", "Tofu"], correct: 0 },
  { question: "Dumplings are popular for CNY because?", choices: ["They resemble silver/gold ingots (wealth)", "Easy to make", "Inexpensive", "Quick"], correct: 0 },
  { question: "Niangao is?", choices: ["Sticky rice cake (homophone for higher year)", "Chicken", "Soup", "Bread"], correct: 0 },
  { question: "Lion dance and dragon dance are performed to?", choices: ["Bring good luck", "Just entertainment", "Mock", "Religious only"], correct: 0 },
  { question: "How many people typically operate a dragon dance?", choices: ["Many (often 9, can be more)", "1", "2", "100"], correct: 0 },
  { question: "'Gong Xi Fa Cai' means?", choices: ["Wishing you prosperity", "Happy new year literally", "Good fortune", "Long life"], correct: 0 },
  { question: "The 'kitchen god' tradition involves?", choices: ["Sending him to heaven before New Year", "Welcoming on Day 1", "Praying on Day 15", "Ignoring entirely"], correct: 0 },
  { question: "Vietnamese version of Lunar New Year?", choices: ["Tet", "Seollal", "Losar", "Chuseok"], correct: 0 },
  { question: "Korean Lunar New Year is?", choices: ["Seollal", "Tet", "Chuseok", "Buddha's Birthday"], correct: 0 },
  { question: "Tibetan New Year is?", choices: ["Losar", "Seollal", "Tet", "Sagaalgan"], correct: 0 },
  { question: "What 12-year cycle do Chinese zodiac animals follow?", choices: ["Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig", "Same as Western zodiac", "Random order", "Reverse alphabetical"], correct: 0 },
  { question: "Chinese zodiac years are paired with?", choices: ["Five elements (wood, fire, earth, metal, water) on 60-year cycle", "10 elements", "Cardinal directions only", "Colors only"], correct: 0 },
  { question: "Lantern Festival features?", choices: ["Lantern displays and tangyuan (sweet rice balls)", "Mooncakes", "Zongzi (rice dumplings)", "Dragon boats"], correct: 0 },
  { question: "What flower is associated with CNY?", choices: ["Peach blossom and plum blossom", "Lotus", "Cherry blossom", "Chrysanthemum"], correct: 0 },
  { question: "Cleaning the house before CNY symbolizes?", choices: ["Sweeping away bad luck (don't sweep on day 1!)", "Just hygiene", "Required by law", "Neighborly tradition"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChineseNewYearQuizSettings): ChineseNewYearQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChineseNewYearQuizState, action: ChineseNewYearQuizAction): ChineseNewYearQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChineseNewYearQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
