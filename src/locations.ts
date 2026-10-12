export const locations = [
  {
    id: "arrakeen",
    name: "Arrakeen",
    category: "CITY · NORTHERN BASIN",
    number: "01",
    point: [-24, 6, -7],
    target: [-24, 3, -7],
    offset: [42, 36, 45],
    description:
      "A city of stone in a world of sand. Beneath the protection of the Shield Wall, Arrakeen becomes the seat of House Atreides on Arrakis.",
    facts: ["House Atreides", "Protected rock basin"],
    note: "The arrival of a new ruling house brings soldiers, aircraft, and a fragile hope for change.",
  },
  {
    id: "residence",
    name: "Atreides residence",
    category: "RESIDENCY · ARRAKEEN",
    number: "02",
    point: [-37, 11, -14],
    target: [-37, 4, -14],
    offset: [24, 19, 26],
    description:
      "A fortified residence inherited from the previous administration. Thick walls shelter the ducal household, while twenty date palms stand in the courtyard.",
    facts: ["Twenty date palms", "Sealed conservatory"],
    note: "Jessica discovers an enclosed conservatory: a startling abundance of green on a planet where every drop of water matters.",
  },
  {
    id: "shield",
    name: "The Shield Wall",
    category: "GEOLOGY · GREAT BARRIER RANGE",
    number: "03",
    point: [10, 23, -44],
    target: [6, 9, -39],
    offset: [40, 32, 40],
    description:
      "A vast natural mountain barrier, rather than an energy shield. Its rock shelters the northern settlements from the most violent desert weather.",
    facts: ["Natural mountain range", "Shelter from desert storms"],
    note: "Beyond the protective rock, the landscape opens into the immense, exposed sand country of Arrakis.",
  },
  {
    id: "spice",
    name: "Spice harvesting",
    category: "INDUSTRY · OPEN DESERT",
    number: "04",
    point: [43, 6, 24],
    target: [43, 2, 24],
    offset: [26, 20, 28],
    description:
      "Far beyond the city, a crawler gathers the spice melange from the sand. A carryall must be ready to lift it away when a sandworm approaches.",
    facts: ["Spice melange", "Crawler & carryall"],
    note: "During an early inspection flight, Duke Leto places the lives of the harvesting crew ahead of the valuable machinery.",
  },
  {
    id: "spaceport",
    name: "Arrakeen landing field",
    category: "TRANSPORT · CITY OUTSKIRTS",
    number: "05",
    point: [-2, 5, 4],
    target: [-2, 2, 4],
    offset: [27, 23, 28],
    description:
      "A landing field on the rocky outskirts of Arrakeen. Ornithopters connect the city to the harvesting operations beyond the mountains.",
    facts: ["Ornithopter aircraft", "Atreides operations"],
    note: "Aircraft make the distances between settled rock and the dangerous open desert possible to cross.",
  },
] as const;
export type LocationId = (typeof locations)[number]["id"];
