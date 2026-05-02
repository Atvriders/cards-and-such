import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation?: string; }
export interface WorldCapitalsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldCapitalsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldCapitalsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the capital of Australia?", choices: ["Sydney","Melbourne","Canberra","Brisbane"], correct: 2, explanation: "Canberra was chosen as a compromise between rival cities Sydney and Melbourne in 1908." },
  { question: "What is the capital of Canada?", choices: ["Toronto","Vancouver","Montreal","Ottawa"], correct: 3, explanation: "Ottawa was selected by Queen Victoria in 1857 as a neutral location between English and French Canada." },
  { question: "What is the capital of Brazil?", choices: ["Rio de Janeiro","Sao Paulo","Brasilia","Salvador"], correct: 2, explanation: "Brasilia was purpose-built and inaugurated in 1960, replacing Rio de Janeiro as the capital." },
  { question: "What is the capital of South Africa (administrative)?", choices: ["Cape Town","Johannesburg","Pretoria","Durban"], correct: 2, explanation: "South Africa has three capitals; Pretoria is the executive (administrative) capital." },
  { question: "What is the capital of Turkey?", choices: ["Istanbul","Ankara","Izmir","Bursa"], correct: 1, explanation: "Ankara replaced Istanbul as capital in 1923 when the Republic of Turkey was founded by Ataturk." },
  { question: "What is the capital of Vietnam?", choices: ["Ho Chi Minh City","Hanoi","Da Nang","Hue"], correct: 1, explanation: "Hanoi has been the capital since 1976 reunification; Ho Chi Minh City is the largest city." },
  { question: "What is the capital of Switzerland?", choices: ["Zurich","Geneva","Bern","Basel"], correct: 2, explanation: "Bern is the de facto capital ('federal city'); Switzerland has no constitutional capital." },
  { question: "What is the capital of Kazakhstan?", choices: ["Almaty","Astana","Shymkent","Karaganda"], correct: 1, explanation: "Astana (renamed Nur-Sultan 2019-2022, now Astana again) became capital in 1997, replacing Almaty." },
  { question: "What is the capital of Nigeria?", choices: ["Lagos","Kano","Abuja","Ibadan"], correct: 2, explanation: "Abuja replaced Lagos as capital in 1991, chosen for its central, neutral location." },
  { question: "What is the capital of New Zealand?", choices: ["Auckland","Wellington","Christchurch","Hamilton"], correct: 1, explanation: "Wellington became the capital in 1865, replacing Auckland for its central position." },
  { question: "What is the capital of Argentina?", choices: ["Cordoba","Rosario","Buenos Aires","Mendoza"], correct: 2, explanation: "Buenos Aires has been the capital since the country's founding in 1816." },
  { question: "What is the capital of Egypt?", choices: ["Alexandria","Cairo","Giza","Luxor"], correct: 1, explanation: "Cairo, founded in 969 AD by the Fatimids, is the largest city in the Arab world." },
  { question: "What is the capital of Norway?", choices: ["Bergen","Oslo","Trondheim","Stavanger"], correct: 1, explanation: "Oslo, founded around 1040, has been the capital since 1814." },
  { question: "What is the capital of Saudi Arabia?", choices: ["Mecca","Jeddah","Riyadh","Medina"], correct: 2, explanation: "Riyadh was the ancestral home of the House of Saud and became capital with the kingdom's founding in 1932." },
  { question: "What is the capital of Greece?", choices: ["Thessaloniki","Athens","Patras","Heraklion"], correct: 1, explanation: "Athens, named after the goddess Athena, has been the capital of modern Greece since 1834." },
  { question: "What is the capital of Portugal?", choices: ["Porto","Lisbon","Coimbra","Faro"], correct: 1, explanation: "Lisbon is one of the oldest cities in Western Europe, predating Rome by centuries." },
  { question: "What is the capital of Ireland?", choices: ["Cork","Galway","Dublin","Limerick"], correct: 2, explanation: "Dublin, founded by Vikings around 841 AD, has been the capital since Irish independence." },
  { question: "What is the capital of South Korea?", choices: ["Busan","Seoul","Incheon","Daegu"], correct: 1, explanation: "Seoul has been Korea's capital for over 600 years, dating back to the Joseon Dynasty in 1394." },
  { question: "What is the capital of Indonesia?", choices: ["Surabaya","Medan","Jakarta","Bandung"], correct: 2, explanation: "Jakarta is currently the capital, though Indonesia is building a new capital, Nusantara, on Borneo." },
  { question: "What is the capital of Pakistan?", choices: ["Karachi","Lahore","Islamabad","Peshawar"], correct: 2, explanation: "Islamabad was purpose-built and replaced Karachi as capital in 1967." },
  { question: "What is the capital of Iran?", choices: ["Isfahan","Shiraz","Tabriz","Tehran"], correct: 3, explanation: "Tehran has been Iran's capital since 1786, when the Qajar dynasty selected it." },
  { question: "What is the capital of Iraq?", choices: ["Basra","Baghdad","Mosul","Erbil"], correct: 1, explanation: "Baghdad, founded in 762 AD, was the heart of the Abbasid Caliphate's Golden Age." },
  { question: "What is the capital of Afghanistan?", choices: ["Kandahar","Kabul","Herat","Mazar-i-Sharif"], correct: 1, explanation: "Kabul has been the capital since 1776, situated in a strategic Hindu Kush valley." },
  { question: "What is the capital of Ukraine?", choices: ["Kharkiv","Lviv","Kyiv","Odesa"], correct: 2, explanation: "Kyiv (Kiev) is one of Eastern Europe's oldest cities, with origins in the 5th century." },
  { question: "What is the capital of Poland?", choices: ["Krakow","Warsaw","Gdansk","Wroclaw"], correct: 1, explanation: "Warsaw replaced Krakow as capital in 1596 under King Sigismund III Vasa." },
  { question: "What is the capital of Hungary?", choices: ["Debrecen","Szeged","Budapest","Miskolc"], correct: 2, explanation: "Budapest was formed in 1873 by uniting Buda, Pest, and Obuda across the Danube." },
  { question: "What is the capital of Cuba?", choices: ["Santiago de Cuba","Havana","Camaguey","Holguin"], correct: 1, explanation: "Havana, founded in 1519, is one of the oldest European-established settlements in the Americas." },
  { question: "What is the capital of Morocco?", choices: ["Casablanca","Marrakech","Fes","Rabat"], correct: 3, explanation: "Rabat became capital under the French protectorate in 1912 and remained after independence." },
  { question: "What is the capital of Ethiopia?", choices: ["Addis Ababa","Dire Dawa","Mekelle","Adama"], correct: 0, explanation: "Addis Ababa ('New Flower') was founded by Emperor Menelik II in 1886." },
  { question: "What is the capital of Mongolia?", choices: ["Erdenet","Ulaanbaatar","Darkhan","Khovd"], correct: 1, explanation: "Ulaanbaatar ('Red Hero') became the capital after Mongolia's 1924 communist revolution." },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldCapitalsQuizSettings): WorldCapitalsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldCapitalsQuizState, action: WorldCapitalsQuizAction): WorldCapitalsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldCapitalsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
