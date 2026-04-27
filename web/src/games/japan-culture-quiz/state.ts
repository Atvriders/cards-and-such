import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JapanCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JapanCultureQuizSettings { questions: "10" | "20"; }
export interface JapanCultureQuizState { questions: JapanCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JapanCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: JapanCultureQuizQuestion[] = [
  { question: "What is the capital of Japan?", choices: ["Kyoto","Osaka","Tokyo","Hiroshima"], correct: 2 },
  { question: "Which writing system is the Japanese phonetic syllabary for native words?", choices: ["Kanji","Hiragana","Katakana","Hangul"], correct: 1 },
  { question: "Studio Ghibli's most famous director is?", choices: ["Mamoru Hosoda","Hayao Miyazaki","Satoshi Kon","Makoto Shinkai"], correct: 1 },
  { question: "Sushi is traditionally served with which fermented soybean sauce?", choices: ["Mirin","Soy sauce","Sake","Rice vinegar"], correct: 1 },
  { question: "The samurai's code of conduct is called?", choices: ["Bushido","Kendo","Judo","Aikido"], correct: 0 },
  { question: "Which era ran from 1603 to 1868?", choices: ["Heian","Edo","Meiji","Showa"], correct: 1 },
  { question: "Mt. Fuji is located on which island?", choices: ["Hokkaido","Honshu","Kyushu","Shikoku"], correct: 1 },
  { question: "Which of these is a thin wheat noodle?", choices: ["Soba","Udon","Ramen","Somen"], correct: 3 },
  { question: "The Japanese flag features what symbol?", choices: ["Crescent","Sun disc","Star","Cherry blossom"], correct: 1 },
  { question: "Naruto's hidden village is?", choices: ["Kumogakure","Sunagakure","Konohagakure","Kirigakure"], correct: 2 },
  { question: "Which festival celebrates cherry blossom viewing?", choices: ["Obon","Hanami","Tanabata","Shichi-Go-San"], correct: 1 },
  { question: "The traditional Japanese garment is the?", choices: ["Hanbok","Kimono","Cheongsam","Sari"], correct: 1 },
  { question: "What does 'arigatou' mean?", choices: ["Hello","Goodbye","Thank you","Sorry"], correct: 2 },
  { question: "Which is NOT one of Japan's main islands?", choices: ["Honshu","Hokkaido","Okinawa","Taiwan"], correct: 3 },
  { question: "Anime film 'Spirited Away' won an Oscar for?", choices: ["Best Picture","Best Animated Feature","Best Director","Best Score"], correct: 1 },
  { question: "Tea ceremony is known as?", choices: ["Sado","Ikebana","Origami","Shodo"], correct: 0 },
  { question: "Which Japanese company makes PlayStation?", choices: ["Nintendo","Sega","Sony","Bandai"], correct: 2 },
  { question: "Sumo wrestlers compete in what arena?", choices: ["Dohyo","Tatami","Tokonoma","Genkan"], correct: 0 },
  { question: "Which island is northernmost?", choices: ["Honshu","Hokkaido","Kyushu","Shikoku"], correct: 1 },
  { question: "Which warlord unified Japan in the late 1500s?", choices: ["Oda Nobunaga","Tokugawa Ieyasu","Toyotomi Hideyoshi","Date Masamune"], correct: 0 },
  { question: "What is wasabi?", choices: ["Pickled radish","Hot green paste","Soy noodle","Rice wine"], correct: 1 },
  { question: "The Meiji Restoration occurred in?", choices: ["1853","1868","1889","1905"], correct: 1 },
  { question: "Which is a famous Japanese horror film director?", choices: ["Akira Kurosawa","Hideo Nakata","Yasujiro Ozu","Takashi Miike"], correct: 1 },
  { question: "'Death Note' protagonist is named?", choices: ["Light Yagami","L Lawliet","Misa Amane","Ryuk"], correct: 0 },
  { question: "Which is a martial art focused on throws?", choices: ["Karate","Judo","Kendo","Sumo"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: JapanCultureQuizSettings): JapanCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JapanCultureQuizState, action: JapanCultureQuizAction): JapanCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JapanCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
