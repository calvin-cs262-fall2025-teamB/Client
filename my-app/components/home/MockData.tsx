// Type definitions
interface Adventure {
  id: string;
  title: string;
  summary: string;
  description?: string;
  image_url: string | null;
  region: {
    id: string;
    name: string;
    center: { lat: number; lng: number };
  };
  tokenCount: number;
  difficulty: string;
  estimatedTime: string;
  status: string;
}
// ============================================================================
// MOCK DATA - Fallback for if Azure Web Service fetch fails
// ============================================================================
const MOCK_ADVENTURES: Adventure[] = [
  {
    id: "1",
    title: "Campus History Tour",
    summary:
      "Discover the rich history of Calvin University through iconic landmarks",
    description:
      "Explore historic buildings, memorable locations, and hidden gems that tell the story of our campus. Learn about the university's founding and significant events.",
    image_url: null,
    region: {
      id: "1",
      name: "North Campus",
      center: { lat: 42.9301, lng: -85.5883 },
    },
    tokenCount: 5,
    difficulty: "Easy",
    estimatedTime: "30 min",
    status: "published",
  },
  {
    id: "2",
    title: "Hidden Art Walk",
    summary: "Find secret art installations scattered across campus",
    description:
      "Discover beautiful murals, sculptures, and installations that many students walk past every day. Each piece has a story about the artists and their inspiration.",
    image_url: null,
    region: {
      id: "2",
      name: "South Campus",
      center: { lat: 42.929, lng: -85.587 },
    },
    tokenCount: 8,
    difficulty: "Medium",
    estimatedTime: "60 min",
    status: "published",
  },
  {
    id: "3",
    title: "Science Building Quest",
    summary: "Explore the wonders of our science facilities",
    description:
      "Visit laboratories, planetariums, and experimental spaces while learning about groundbreaking discoveries made right here at Calvin. Perfect for curious minds.",
    image_url: null,
    region: {
      id: "1",
      name: "North Campus",
      center: { lat: 42.9301, lng: -85.5883 },
    },
    tokenCount: 6,
    difficulty: "Medium",
    estimatedTime: "45 min",
    status: "published",
  },
  {
    id: "4",
    title: "Athletic Heritage Trail",
    summary: "Journey through Calvin's sports history and achievements",
    description:
      "Visit iconic sports venues and learn about legendary athletes who made their mark. Experience the pride and tradition of Calvin athletics.",
    image_url: null,
    region: {
      id: "3",
      name: "Athletic Complex",
      center: { lat: 42.9315, lng: -85.5895 },
    },
    tokenCount: 4,
    difficulty: "Easy",
    estimatedTime: "25 min",
    status: "published",
  },
  {
    id: "5",
    title: "Ecosystem Discovery",
    summary: "Explore Calvin's natural habitats and biodiversity",
    description:
      "A challenging adventure through various ecosystems on campus. Learn about local flora and fauna while collecting tokens at ecological points of interest.",
    image_url: null,
    region: {
      id: "4",
      name: "Ecosystem Preserve",
      center: { lat: 42.9285, lng: -85.587 },
    },
    tokenCount: 10,
    difficulty: "Hard",
    estimatedTime: "90 min",
    status: "published",
  },
];

export { MOCK_ADVENTURES, Adventure };
