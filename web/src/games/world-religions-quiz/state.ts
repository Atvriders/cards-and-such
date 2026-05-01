import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldReligionsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldReligionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldReligionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's the most widespread world religion?", choices: ["Christianity","Islam","Hinduism","Buddhism"], correct: 0 },
  { question: "What's the second-largest world religion?", choices: ["Islam","Hinduism","Buddhism","Christianity"], correct: 0 },
  { question: "What's the oldest of the major world religions?", choices: ["Hinduism","Judaism","Buddhism","Christianity"], correct: 0 },
  { question: "What's the holy book of Christianity?", choices: ["Bible","Quran","Torah","Vedas"], correct: 0 },
  { question: "What's Islam's holy book?", choices: ["Quran","Bible","Torah","Hadith"], correct: 0 },
  { question: "What's the Jewish holy book?", choices: ["Torah/Tanakh","Bible","Talmud also","Both Torah and Talmud"], correct: 3 },
  { question: "What's the Hindu holy book?", choices: ["Vedas (and many others)","Just Vedas","Both","Mahabharata"], correct: 2 },
  { question: "What's the Buddhist scripture?", choices: ["Tripitaka","Sutras","Both","Lotus Sutra"], correct: 2 },
  { question: "What's Sikhism's holy book?", choices: ["Guru Granth Sahib","Bible","Quran","Vedas"], correct: 0 },
  { question: "Who founded Sikhism?", choices: ["Guru Nanak","Buddha","Christ","Muhammad"], correct: 0 },
  { question: "Where did Sikhism originate?", choices: ["Punjab, India","Saudi Arabia","Israel","China"], correct: 0 },
  { question: "What's Judaism's main belief?", choices: ["One God (Yahweh)","Many gods","Both","Pantheism"], correct: 0 },
  { question: "What's Christianity's central belief?", choices: ["Jesus Christ as savior","One God","Both","Trinity"], correct: 2 },
  { question: "What's Islam's central belief?", choices: ["One God Allah, Muhammad his prophet","Just one God","Both","Just Muhammad"], correct: 2 },
  { question: "What are Islam's Five Pillars?", choices: ["Shahada, Salah, Zakat, Sawm, Hajj","Just five duties","Both","Just pillars"], correct: 2 },
  { question: "What's Hajj?", choices: ["Pilgrimage to Mecca","Prayer","Fasting","Charity"], correct: 0 },
  { question: "What's Ramadan?", choices: ["Holy month of fasting","Prayer","Charity","Pilgrimage"], correct: 0 },
  { question: "Where do Muslims face when praying?", choices: ["Mecca (Kaaba)","Medina","Jerusalem","Just east"], correct: 0 },
  { question: "Where do Jews face when praying?", choices: ["Jerusalem (Temple Mount)","Mecca","East","Just up"], correct: 0 },
  { question: "What's Confucianism's founder?", choices: ["Confucius","Lao Tzu","Buddha","Just teacher"], correct: 0 },
  { question: "What's Taoism's founder traditionally?", choices: ["Lao Tzu","Confucius","Buddha","Both"], correct: 0 },
  { question: "What's Shinto?", choices: ["Native Japanese religion","Chinese","Both","Korean"], correct: 0 },
  { question: "What's Zoroastrianism's founder?", choices: ["Zoroaster","Mani","Buddha","Both"], correct: 0 },
  { question: "Where is Mecca?", choices: ["Saudi Arabia","Iran","Iraq","UAE"], correct: 0 },
  { question: "Where is the Vatican?", choices: ["Rome","Italy","Both","Just Rome"], correct: 2 },
  { question: "What's the leader of Roman Catholicism?", choices: ["The Pope","Bishop","Cardinal","Patriarch"], correct: 0 },
  { question: "How many books in the Old Testament (Protestant)?", choices: ["39","27","66","73"], correct: 0 },
  { question: "How many books in the New Testament?", choices: ["27","39","66","73"], correct: 0 },
  { question: "What's the Holy Trinity in Christianity?", choices: ["Father, Son, Holy Spirit","Three gods","Both terms","Different"], correct: 2 },
  { question: "What's the Sabbath in Judaism?", choices: ["Saturday day of rest","Just Saturday","Both","Sunday"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldReligionsQuizSettings): WorldReligionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldReligionsQuizState, action: WorldReligionsQuizAction): WorldReligionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldReligionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
