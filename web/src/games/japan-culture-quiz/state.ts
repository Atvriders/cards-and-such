import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JapanCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JapanCultureQuizSettings { questions: "10" | "20"; }
export interface JapanCultureQuizState { questions: JapanCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JapanCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: JapanCultureQuizQuestion[] = [
  { question: "What is the capital of Japan?", choices: ["Kyoto","Osaka","Tokyo","Sapporo"], correct: 2 },
  { question: "Mount Fuji is located on which Japanese island?", choices: ["Hokkaido","Honshu","Kyushu","Shikoku"], correct: 1 },
  { question: "Which era ran from 1603 to 1868 under the Tokugawa shogunate?", choices: ["Heian","Edo","Meiji","Showa"], correct: 1 },
  { question: "The Meiji Restoration began in which year?", choices: ["1853","1868","1889","1905"], correct: 1 },
  { question: "Who unified Japan at the end of the Sengoku period?", choices: ["Oda Nobunaga","Tokugawa Ieyasu","Toyotomi Hideyoshi","Date Masamune"], correct: 1 },
  { question: "What is the traditional Japanese tea ceremony called?", choices: ["Sado","Ikebana","Origami","Shodo"], correct: 0 },
  { question: "Which dish consists of vinegared rice with raw fish or other toppings?", choices: ["Ramen","Tempura","Sushi","Yakitori"], correct: 2 },
  { question: "Wasabi is best described as a?", choices: ["Pickled radish","Spicy green paste","Fermented bean","Rice wine"], correct: 1 },
  { question: "Which is a thin buckwheat noodle?", choices: ["Udon","Ramen","Soba","Somen"], correct: 2 },
  { question: "The Japanese flag depicts what symbol?", choices: ["Crescent moon","Red sun disc","Cherry blossom","White star"], correct: 1 },
  { question: "Which is NOT one of Japan's four main islands?", choices: ["Honshu","Hokkaido","Okinawa","Kyushu"], correct: 2 },
  { question: "Hayao Miyazaki co-founded which animation studio?", choices: ["Studio Ghibli","Madhouse","Toei","Bones"], correct: 0 },
  { question: "Which Akira Kurosawa film inspired The Magnificent Seven?", choices: ["Rashomon","Seven Samurai","Ran","Yojimbo"], correct: 1 },
  { question: "The samurai's code of honor is called?", choices: ["Bushido","Kendo","Judo","Aikido"], correct: 0 },
  { question: "Hiroshima was bombed on which date in 1945?", choices: ["August 6","August 9","July 26","September 2"], correct: 0 },
  { question: "Which Japanese company was founded in 1889 making playing cards?", choices: ["Sony","Nintendo","Sega","Konami"], correct: 1 },
  { question: "The bullet train is known as the?", choices: ["Maglev","Shinkansen","Limited Express","Romancecar"], correct: 1 },
  { question: "Which festival celebrates cherry blossom viewing?", choices: ["Obon","Hanami","Tanabata","Setsubun"], correct: 1 },
  { question: "What is Japan's tallest mountain?", choices: ["Mt. Tate","Mt. Fuji","Mt. Aso","Mt. Asama"], correct: 1 },
  { question: "Which strait separates Honshu from Hokkaido?", choices: ["Kanmon","Tsugaru","Bungo","Soya"], correct: 1 },
  { question: "Tokyo was formerly known as?", choices: ["Kyoto","Edo","Nara","Osaka"], correct: 1 },
  { question: "The novelist who wrote 'Norwegian Wood' is?", choices: ["Yukio Mishima","Haruki Murakami","Yasunari Kawabata","Kenzaburo Oe"], correct: 1 },
  { question: "Sake is brewed primarily from?", choices: ["Barley","Rice","Wheat","Sorghum"], correct: 1 },
  { question: "Miso is a paste made from fermented?", choices: ["Rice","Soybeans","Fish","Seaweed"], correct: 1 },
  { question: "Which religion native to Japan venerates kami?", choices: ["Buddhism","Shinto","Taoism","Confucianism"], correct: 1 },
  { question: "Tempura cooking technique was influenced by which Europeans?", choices: ["Dutch","Portuguese","Spanish","British"], correct: 1 },
  { question: "The 1923 Great Kanto Earthquake devastated which city?", choices: ["Osaka","Tokyo","Sendai","Kobe"], correct: 1 },
  { question: "Which writing system uses borrowed Chinese characters?", choices: ["Hiragana","Katakana","Kanji","Romaji"], correct: 2 },
  { question: "Sumo wrestlers compete inside a ring called the?", choices: ["Dohyo","Tatami","Tokonoma","Genkan"], correct: 0 },
  { question: "Which Nobel laureate wrote 'Snow Country' (Yukiguni)?", choices: ["Yasunari Kawabata","Kenzaburo Oe","Junichiro Tanizaki","Soseki Natsume"], correct: 0 }
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
