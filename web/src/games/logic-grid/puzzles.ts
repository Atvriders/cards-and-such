// Logic Grid puzzles — 5 attributes × 5 values each
// Player deduces which value each entity has for each attribute.
// attributes[0] = entity names (rows), attributes[1..4] = 4 other attributes
// solution[entity][attr] = value index (0-4) for attrs 1-4

export interface LogicGridPuzzle {
  title: string;
  /** 5 attribute categories, each with 5 label strings */
  attributes: [string[], string[], string[], string[], string[]];
  /** For entity i and attribute j (1-4): solution[i][j-1] = value index in attributes[j] */
  solution: number[][];
  /** Text clues the player uses to deduce the solution */
  clues: string[];
}

export const PUZZLES: LogicGridPuzzle[] = [
  {
    title: "Five Neighbors",
    attributes: [
      ["Alice", "Bob", "Carol", "Dave", "Eve"],       // 0: people
      ["Red", "Blue", "Green", "Yellow", "Purple"],   // 1: house colors
      ["Cat", "Dog", "Fish", "Bird", "Hamster"],      // 2: pets
      ["Tea", "Coffee", "Juice", "Milk", "Water"],    // 3: drinks
      ["1st", "2nd", "3rd", "4th", "5th"],            // 4: positions
    ],
    // solution[person][attr-1]: alice=0,bob=1,carol=2,dave=3,eve=4
    // house: alice=Red(0),bob=Blue(1),carol=Green(2),dave=Yellow(3),eve=Purple(4)
    // pet: alice=Cat(0),bob=Dog(1),carol=Fish(2),dave=Bird(3),eve=Hamster(4)
    // drink: alice=Tea(0),bob=Coffee(1),carol=Juice(2),dave=Milk(3),eve=Water(4)
    // position: alice=1st(0),bob=2nd(1),carol=3rd(2),dave=4th(3),eve=5th(4)
    solution: [
      [0, 0, 0, 0], // Alice: Red, Cat, Tea, 1st
      [1, 1, 1, 1], // Bob: Blue, Dog, Coffee, 2nd
      [2, 2, 2, 2], // Carol: Green, Fish, Juice, 3rd
      [3, 3, 3, 3], // Dave: Yellow, Bird, Milk, 4th
      [4, 4, 4, 4], // Eve: Purple, Hamster, Water, 5th
    ],
    clues: [
      "Alice lives in the Red house.",
      "Bob has a Dog.",
      "Carol drinks Juice.",
      "Dave lives in the 4th position.",
      "Eve has the Purple house.",
      "The person with a Cat drinks Tea.",
      "The person with a Dog lives in the Blue house.",
      "The person in position 3rd has a Fish.",
      "The person who drinks Milk has a Bird.",
      "The person in 5th position drinks Water.",
    ],
  },
  {
    title: "Island Explorers",
    attributes: [
      ["Ana", "Ben", "Cleo", "Dan", "Fay"],
      ["North", "South", "East", "West", "Central"],  // 1: island region
      ["Kayak", "Boat", "Swim", "Raft", "Dive"],      // 2: travel mode
      ["Shell", "Coral", "Fossil", "Pearl", "Stone"], // 3: treasure found
      ["Sunny", "Rainy", "Windy", "Foggy", "Clear"],  // 4: weather
    ],
    // Ana=0,Ben=1,Cleo=2,Dan=3,Fay=4
    // region: Ana=North(0),Ben=South(1),Cleo=East(2),Dan=West(3),Fay=Central(4)
    // travel: Ana=Kayak(0),Ben=Boat(1),Cleo=Swim(2),Dan=Raft(3),Fay=Dive(4)
    // treasure: Ana=Shell(0),Ben=Coral(1),Cleo=Fossil(2),Dan=Pearl(3),Fay=Stone(4)
    // weather: Ana=Sunny(0),Ben=Rainy(1),Cleo=Windy(2),Dan=Foggy(3),Fay=Clear(4)
    solution: [
      [0, 0, 0, 0], // Ana
      [1, 1, 1, 1], // Ben
      [2, 2, 2, 2], // Cleo
      [3, 3, 3, 3], // Dan
      [4, 4, 4, 4], // Fay
    ],
    clues: [
      "Ana explored the North region.",
      "Ben traveled by Boat.",
      "Cleo found a Fossil.",
      "Dan encountered Foggy weather.",
      "Fay explored the Central region.",
      "The Kayak explorer found a Shell.",
      "The South explorer had Rainy weather.",
      "The Swimmer found a Fossil.",
      "The Pearl finder traveled by Raft.",
      "The Clear-weather explorer went to the Central region.",
    ],
  },
  {
    title: "Bookshelf",
    attributes: [
      ["Amy", "Bram", "Cora", "Duke", "Ella"],
      ["Mystery", "SciFi", "Romance", "History", "Fantasy"],  // 1: genre
      ["Red", "Blue", "Green", "Black", "White"],             // 2: cover color
      ["100", "200", "300", "400", "500"],                    // 3: pages (index)
      ["Mon", "Tue", "Wed", "Thu", "Fri"],                    // 4: read day
    ],
    solution: [
      [0, 0, 0, 0], // Amy: Mystery, Red cover, 100 pages, Mon
      [1, 1, 1, 1], // Bram: SciFi, Blue, 200, Tue
      [2, 2, 2, 2], // Cora: Romance, Green, 300, Wed
      [3, 3, 3, 3], // Duke: History, Black, 400, Thu
      [4, 4, 4, 4], // Ella: Fantasy, White, 500, Fri
    ],
    clues: [
      "Amy read a Mystery book.",
      "Bram's book had a Blue cover.",
      "Cora's book had 300 pages.",
      "Duke read on Thursday.",
      "Ella's book was Fantasy.",
      "The Mystery book had a Red cover.",
      "The SciFi book was read on Tuesday.",
      "The Green-covered book had 300 pages.",
      "The History book was Black-covered.",
      "The 500-page book was read on Friday.",
    ],
  },
  {
    title: "Space Crew",
    attributes: [
      ["Zara", "Orion", "Luna", "Mars", "Nova"],
      ["Pilot", "Engineer", "Doctor", "Scientist", "Commander"],  // 1: role
      ["Red", "Orange", "Yellow", "Green", "Blue"],               // 2: suit color
      ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"],             // 3: sector
      ["Yr1", "Yr2", "Yr3", "Yr4", "Yr5"],                       // 4: experience
    ],
    solution: [
      [0, 0, 0, 0], // Zara: Pilot, Red, Alpha, Yr1
      [1, 1, 1, 1], // Orion: Engineer, Orange, Beta, Yr2
      [2, 2, 2, 2], // Luna: Doctor, Yellow, Gamma, Yr3
      [3, 3, 3, 3], // Mars: Scientist, Green, Delta, Yr4
      [4, 4, 4, 4], // Nova: Commander, Blue, Epsilon, Yr5
    ],
    clues: [
      "Zara is the Pilot.",
      "Orion wears an Orange suit.",
      "Luna works in the Gamma sector.",
      "Mars has 4 years of experience.",
      "Nova is the Commander.",
      "The Pilot has a Red suit.",
      "The Engineer works in Beta sector.",
      "The Doctor has 3 years of experience.",
      "The Scientist wears a Green suit.",
      "The most experienced crew member is in the Epsilon sector.",
    ],
  },
  {
    title: "Chefs",
    attributes: [
      ["Ian", "Jo", "Kim", "Lee", "May"],
      ["Italian", "French", "Japanese", "Mexican", "Indian"],  // 1: cuisine
      ["Knife", "Pan", "Wok", "Grill", "Pot"],                 // 2: tool
      ["Morning", "Noon", "Afternoon", "Evening", "Night"],    // 3: shift
      ["Soup", "Pasta", "Sushi", "Tacos", "Curry"],            // 4: specialty
    ],
    solution: [
      [0, 0, 0, 0], // Ian: Italian, Knife, Morning, Soup
      [1, 1, 1, 1], // Jo: French, Pan, Noon, Pasta
      [2, 2, 2, 2], // Kim: Japanese, Wok, Afternoon, Sushi
      [3, 3, 3, 3], // Lee: Mexican, Grill, Evening, Tacos
      [4, 4, 4, 4], // May: Indian, Pot, Night, Curry
    ],
    clues: [
      "Ian cooks Italian cuisine.",
      "Jo uses a Pan.",
      "Kim works the Afternoon shift.",
      "Lee's specialty is Tacos.",
      "May cooks Indian cuisine.",
      "The Italian chef uses a Knife.",
      "The French chef works the Noon shift.",
      "The Wok user makes Sushi.",
      "The Mexican chef works Evening.",
      "The Night-shift chef specializes in Curry.",
    ],
  },
];
