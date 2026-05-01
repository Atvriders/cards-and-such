import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HanukkahQuizSettings { questions: "10" | "20" | "30"; }
export interface HanukkahQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HanukkahQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hanukkah celebrates the rededication of?", choices: ["The Second Temple in Jerusalem", "The First Temple", "The Western Wall", "The Synagogue of Alexandria"], correct: 0 },
  { question: "Hanukkah lasts how many nights?", choices: ["Eight", "Seven", "Five", "Ten"], correct: 0 },
  { question: "Hanukkah celebrates which historical victory?", choices: ["Maccabean revolt over Seleucid Greeks", "Babylonian exile end", "Roman conquest", "Crusader victory"], correct: 0 },
  { question: "Who led the Maccabean revolt?", choices: ["Judah Maccabee", "King David", "King Solomon", "Bar Kochba"], correct: 0 },
  { question: "The miracle of Hanukkah involved?", choices: ["Oil lasting 8 days when only enough for 1", "Manna from heaven", "Parting of sea", "Burning bush"], correct: 0 },
  { question: "The Hanukkah candelabrum is called?", choices: ["Hanukkiah (or menorah colloquially)", "Mezuzah", "Tallit", "Shofar"], correct: 0 },
  { question: "How many candles does a Hanukkiah hold (including shamash)?", choices: ["Nine", "Seven", "Eight", "Ten"], correct: 0 },
  { question: "What is the 'shamash'?", choices: ["The helper candle used to light others", "A prayer", "A song", "A food"], correct: 0 },
  { question: "Hanukkah falls on the Hebrew month of?", choices: ["Kislev (25th day starts)", "Tishrei", "Nisan", "Adar"], correct: 0 },
  { question: "What dreidel letters represent in Hebrew?", choices: ["Nes Gadol Hayah Sham (a great miracle happened there)", "Names of months", "Greetings", "Numbers only"], correct: 0 },
  { question: "In Israel, the dreidel changes one letter to mean?", choices: ["A great miracle happened HERE (Po instead of Sham)", "Same letters", "All Hebrew alphabet", "Different game"], correct: 0 },
  { question: "Traditional Hanukkah food fried in oil?", choices: ["Latkes (potato pancakes)", "Bagels", "Matzo balls", "Challah"], correct: 0 },
  { question: "Israeli Hanukkah doughnut is called?", choices: ["Sufganiyot (jelly-filled)", "Babka", "Rugelach", "Hamantaschen"], correct: 0 },
  { question: "What festival is sometimes called 'Festival of Lights'?", choices: ["Hanukkah", "Passover", "Yom Kippur", "Sukkot"], correct: 0 },
  { question: "Maccabees historical period?", choices: ["Around 167-160 BCE (revolt)", "1000 CE", "500 BCE", "100 CE"], correct: 0 },
  { question: "The Seleucid king who desecrated the Temple?", choices: ["Antiochus IV Epiphanes", "Cyrus the Great", "Darius", "Alexander the Great"], correct: 0 },
  { question: "Books of Maccabees are in?", choices: ["Apocrypha (Catholic/Orthodox canon, not Tanakh)", "Hebrew Bible", "Quran", "Pentateuch"], correct: 0 },
  { question: "Hanukkah blessing 'Shehecheyanu' is recited?", choices: ["On the first night only (for new occasion)", "Every night", "Final night", "Not at all"], correct: 0 },
  { question: "Songs commonly sung at Hanukkah?", choices: ["Maoz Tzur, Hanukkah Oh Hanukkah, Sevivon", "Hava Nagila only", "Dayenu", "Hatikvah"], correct: 0 },
  { question: "Adam Sandler's 'Hanukkah Song' debuted on?", choices: ["SNL Weekend Update (1994)", "Comedy Central", "Tonight Show", "Late Show"], correct: 0 },
  { question: "Hanukkah gelt is?", choices: ["Coins (chocolate or real, often given to children)", "Candle", "Prayer book", "Decoration"], correct: 0 },
  { question: "The dreidel game is played for?", choices: ["Nuts, gelt, candy", "Real money exclusively", "Books", "Songs"], correct: 0 },
  { question: "Hanukkah is sometimes called?", choices: ["Festival of Dedication", "Festival of Tabernacles", "Festival of Booths", "Festival of Weeks"], correct: 0 },
  { question: "Hanukkiah candles burn for at least?", choices: ["30 minutes per night minimum (custom)", "Whole day", "Hour", "5 minutes"], correct: 0 },
  { question: "Hanukkah candles are lit?", choices: ["After sundown (placed at window/doorway)", "Morning only", "Noon", "Anytime"], correct: 0 },
  { question: "Hanukkah-themed food besides latkes?", choices: ["Brisket and dairy dishes (varied tradition)", "Just bread", "Just fish", "Just rice"], correct: 0 },
  { question: "Modern Hanukkah gift-giving is influenced by?", choices: ["Proximity to Christmas (especially in US)", "Ancient law", "Bible commandment", "Soviet tradition"], correct: 0 },
  { question: "The Maccabees restored worship at?", choices: ["The Second Temple in Jerusalem (165 BCE)", "Tabernacle", "Mount Sinai", "Babylon"], correct: 0 },
  { question: "Hanukkah is also spelled?", choices: ["Chanukah, Hanukah, Hanukkah", "Only one way", "Hannukah only", "Khanukah only"], correct: 0 },
  { question: "First night candle is placed?", choices: ["Right side of hanukkiah, lit first; subsequent nights add to left", "Center", "Random", "Left side first"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HanukkahQuizSettings): HanukkahQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HanukkahQuizState, action: HanukkahQuizAction): HanukkahQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HanukkahQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
