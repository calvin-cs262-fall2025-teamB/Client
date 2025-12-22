/**
 * Centralized Mock Data for WayFind App
 *
 * This file provides fallback data for all components when the Azure backend is unavailable.
 * All data structures match the database schema defined in types/database.ts.
 *
 * Usage: Import specific mock data arrays from this file in contexts or components.
 */

import {
  Adventure,
  Adventurer,
  AdventureWithRegion,
  CompletedAdventure,
  Landmark,
  Point,
  Region,
  Token,
} from "@/types/database";

// ============================================================================
// Mock Adventurers (Users)
// ============================================================================

export const mockAdventurers: Adventurer[] = [
  {
    id: 1,
    username: "AdventureSeeker",
    password: "pass123",
    profilepicture: "pictures/avatar1.jpg",
  },
  {
    id: 2,
    username: "ExplorerMax",
    password: "secure456",
    profilepicture: "pictures/avatar2.jpg",
  },
  {
    id: 3,
    username: "QuestMaster",
    password: "password789",
    profilepicture: "pictures/avatar3.jpg",
  },
  {
    id: 4,
    username: "TreasureHunter",
    password: "hunt2024",
    profilepicture: "pictures/avatar4.jpg",
  },
  {
    id: 5,
    username: "WandererSarah",
    password: "explore99",
    profilepicture: "pictures/avatar5.jpg",
  },
  {
    id: 6,
    username: "TrailBlazer",
    password: "trail2024",
    profilepicture: "pictures/avatar6.jpg",
  },
  {
    id: 7,
    username: "AdventureAlex",
    password: "adventure1",
    profilepicture: "pictures/avatar7.jpg",
  },
  {
    id: 8,
    username: "ScopeRunner",
    password: "scope456",
    profilepicture: "pictures/avatar8.jpg",
  },
  {
    id: 9,
    username: "PathFinder",
    password: "path2024",
    profilepicture: "pictures/avatar9.jpg",
  },
  {
    id: 10,
    username: "QuestJordan",
    password: "jordan123",
    profilepicture: "pictures/avatar10.jpg",
  },
  {
    id: 11,
    username: "ExploreEmma",
    password: "emma2024",
    profilepicture: "pictures/avatar11.jpg",
  },
  {
    id: 12,
    username: "AdventureJake",
    password: "jake789",
    profilepicture: "pictures/avatar12.jpg",
  },
  {
    id: 13,
    username: "SeekSamantha",
    password: "sam2024",
    profilepicture: "pictures/avatar13.jpg",
  },
  {
    id: 14,
    username: "RoamRyan",
    password: "ryan456",
    profilepicture: "pictures/avatar14.jpg",
  },
  {
    id: 15,
    username: "QuestQuinn",
    password: "quinn789",
    profilepicture: "pictures/avatar15.jpg",
  },
  {
    id: 16,
    username: "dev",
    password: "Adventure123!",
    profilepicture: "pictures/avatar16.jpg",
  },
];

// ============================================================================
// Mock Regions
// ============================================================================

export const mockRegions: Region[] = [
  {
    id: 1,
    adventurerid: 1,
    name: "Downtown Historic District",
    description: "Explore the rich history of downtown with landmarks dating back to the 1800s",
    location: { x: 42.9634, y: -85.6681 } as Point,
    radius: 500,
  },
  {
    id: 2,
    adventurerid: 2,
    name: "Riverside Nature Trail",
    description: "Beautiful walking paths along the river with wildlife viewing opportunities",
    location: { x: 42.9704, y: -85.6584 } as Point,
    radius: 750,
  },
  {
    id: 3,
    adventurerid: 3,
    name: "University Campus",
    description: "Discover hidden gems and interesting facts about the campus grounds",
    location: { x: 42.9313, y: -85.5881 } as Point,
    radius: 400,
  },
  {
    id: 4,
    adventurerid: 4,
    name: "Woodland Park Adventure",
    description: "Family-friendly adventure through scenic woodland trails",
    location: { x: 42.9245, y: -85.6234 } as Point,
    radius: 600,
  },
  {
    id: 5,
    adventurerid: 5,
    name: "City Center Quest",
    description: "Urban adventure through the bustling city center and shopping districts",
    location: { x: 42.9616, y: -85.6557 } as Point,
    radius: 350,
  },
  {
    id: 6,
    adventurerid: 6,
    name: "Lakefront Discovery",
    description: "Scenic adventure along the beautiful lakefront with water activities",
    location: { x: 42.9789, y: -85.6423 } as Point,
    radius: 800,
  },
  {
    id: 7,
    adventurerid: 7,
    name: "Heritage Village",
    description: "Step back in time exploring historical buildings and cultural sites",
    location: { x: 42.9456, y: -85.6789 } as Point,
    radius: 450,
  },
  {
    id: 8,
    adventurerid: 8,
    name: "Science District",
    description: "Interactive adventure through museums and science centers",
    location: { x: 42.9567, y: -85.6345 } as Point,
    radius: 300,
  },
  {
    id: 9,
    adventurerid: 9,
    name: "Art Gallery Walk",
    description: "Creative journey through local art galleries and street art",
    location: { x: 42.9678, y: -85.6512 } as Point,
    radius: 250,
  },
  {
    id: 10,
    adventurerid: 10,
    name: "Sports Complex Challenge",
    description: "Athletic adventure through various sports facilities and stadiums",
    location: { x: 42.9389, y: -85.6678 } as Point,
    radius: 400,
  },
  {
    id: 11,
    adventurerid: 11,
    name: "Mountain View Trail",
    description: "Challenging hike with breathtaking mountain views and photo opportunities",
    location: { x: 42.9812, y: -85.7123 } as Point,
    radius: 1000,
  },
  {
    id: 12,
    adventurerid: 12,
    name: "Garden District Stroll",
    description: "Peaceful walk through beautiful gardens and botanical displays",
    location: { x: 42.9234, y: -85.6456 } as Point,
    radius: 350,
  },
  {
    id: 13,
    adventurerid: 1,
    name: "Test Zone Alpha",
    description: "Easy test region for demos and user testing",
    location: { x: 42.9300, y: -85.6500 } as Point,
    radius: 200,
  },
  {
    id: 14,
    adventurerid: 2,
    name: "Demo Area Beta",
    description: "Simple demo area with clear landmarks",
    location: { x: 42.9400, y: -85.6600 } as Point,
    radius: 150,
  },
  {
    id: 15,
    adventurerid: 3,
    name: "Practice Ground",
    description: "Perfect for first-time users to learn the app",
    location: { x: 42.9500, y: -85.6700 } as Point,
    radius: 100,
  },
];

// ============================================================================
// Mock Landmarks
// ============================================================================

export const mockLandmarks: Landmark[] = [
  // Downtown Historic District (Region 1)
  { id: 1, regionid: 1, name: "Old Town Hall", location: { x: 42.9628, y: -85.6675 } as Point },
  { id: 2, regionid: 1, name: "Historic Clock Tower", location: { x: 42.9640, y: -85.6687 } as Point },
  { id: 3, regionid: 1, name: "Heritage Museum", location: { x: 42.9622, y: -85.6693 } as Point },

  // Riverside Nature Trail (Region 2)
  { id: 4, regionid: 2, name: "River Overlook", location: { x: 42.9710, y: -85.6578 } as Point },
  { id: 5, regionid: 2, name: "Wildlife Observation Deck", location: { x: 42.9698, y: -85.6590 } as Point },
  { id: 6, regionid: 2, name: "Fishing Pier", location: { x: 42.9716, y: -85.6572 } as Point },

  // University Campus (Region 3)
  { id: 7, regionid: 3, name: "Main Library", location: { x: 42.9307, y: -85.5875 } as Point },
  { id: 8, regionid: 3, name: "Student Union", location: { x: 42.9319, y: -85.5887 } as Point },
  { id: 9, regionid: 3, name: "Science Building", location: { x: 42.9301, y: -85.5869 } as Point },

  // Woodland Park Adventure (Region 4)
  { id: 10, regionid: 4, name: "Ancient Oak Tree", location: { x: 42.9239, y: -85.6228 } as Point },
  { id: 11, regionid: 4, name: "Hidden Waterfall", location: { x: 42.9251, y: -85.6240 } as Point },
  { id: 12, regionid: 4, name: "Forest Clearing", location: { x: 42.9233, y: -85.6222 } as Point },

  // City Center Quest (Region 5)
  { id: 13, regionid: 5, name: "Central Fountain", location: { x: 42.9610, y: -85.6551 } as Point },
  { id: 14, regionid: 5, name: "Shopping Plaza", location: { x: 42.9622, y: -85.6563 } as Point },
  { id: 15, regionid: 5, name: "Business District", location: { x: 42.9604, y: -85.6545 } as Point },

  // Lakefront Discovery (Region 6)
  { id: 16, regionid: 6, name: "Lighthouse Point", location: { x: 42.9795, y: -85.6417 } as Point },
  { id: 17, regionid: 6, name: "Sandy Beach", location: { x: 42.9783, y: -85.6429 } as Point },
  { id: 18, regionid: 6, name: "Boat Launch", location: { x: 42.9801, y: -85.6411 } as Point },

  // Heritage Village (Region 7)
  { id: 19, regionid: 7, name: "Blacksmith Shop", location: { x: 42.9450, y: -85.6783 } as Point },
  { id: 20, regionid: 7, name: "Old School House", location: { x: 42.9462, y: -85.6795 } as Point },
  { id: 21, regionid: 7, name: "Village Church", location: { x: 42.9444, y: -85.6777 } as Point },

  // Science District (Region 8)
  { id: 22, regionid: 8, name: "Planetarium", location: { x: 42.9561, y: -85.6339 } as Point },
  { id: 23, regionid: 8, name: "Natural History Museum", location: { x: 42.9573, y: -85.6351 } as Point },
  { id: 24, regionid: 8, name: "Technology Center", location: { x: 42.9555, y: -85.6333 } as Point },

  // Art Gallery Walk (Region 9)
  { id: 25, regionid: 9, name: "Modern Art Gallery", location: { x: 42.9672, y: -85.6506 } as Point },
  { id: 26, regionid: 9, name: "Sculpture Garden", location: { x: 42.9684, y: -85.6518 } as Point },
  { id: 27, regionid: 9, name: "Street Art Mural", location: { x: 42.9666, y: -85.6500 } as Point },

  // Sports Complex Challenge (Region 10)
  { id: 28, regionid: 10, name: "Main Stadium", location: { x: 42.9383, y: -85.6672 } as Point },
  { id: 29, regionid: 10, name: "Tennis Courts", location: { x: 42.9395, y: -85.6684 } as Point },
  { id: 30, regionid: 10, name: "Swimming Pool", location: { x: 42.9377, y: -85.6666 } as Point },

  // Mountain View Trail (Region 11)
  { id: 31, regionid: 11, name: "Summit Viewpoint", location: { x: 42.9818, y: -85.7117 } as Point },
  { id: 32, regionid: 11, name: "Eagle Rock", location: { x: 42.9806, y: -85.7129 } as Point },
  { id: 33, regionid: 11, name: "Pine Grove Rest Area", location: { x: 42.9824, y: -85.7105 } as Point },

  // Garden District Stroll (Region 12)
  { id: 34, regionid: 12, name: "Rose Garden", location: { x: 42.9228, y: -85.6450 } as Point },
  { id: 35, regionid: 12, name: "Butterfly Conservatory", location: { x: 42.9240, y: -85.6462 } as Point },
  { id: 36, regionid: 12, name: "Herb Garden", location: { x: 42.9222, y: -85.6444 } as Point },

  // Test Zone Alpha (Region 13)
  { id: 37, regionid: 13, name: "Test Point A", location: { x: 42.9295, y: -85.6495 } as Point },
  { id: 38, regionid: 13, name: "Test Point B", location: { x: 42.9305, y: -85.6505 } as Point },
  { id: 39, regionid: 13, name: "Test Point C", location: { x: 42.9285, y: -85.6485 } as Point },

  // Demo Area Beta (Region 14)
  { id: 40, regionid: 14, name: "Demo Marker 1", location: { x: 42.9395, y: -85.6595 } as Point },
  { id: 41, regionid: 14, name: "Demo Marker 2", location: { x: 42.9405, y: -85.6605 } as Point },
  { id: 42, regionid: 14, name: "Demo Marker 3", location: { x: 42.9385, y: -85.6585 } as Point },

  // Practice Ground (Region 15)
  { id: 43, regionid: 15, name: "Start Here", location: { x: 42.9495, y: -85.6695 } as Point },
  { id: 44, regionid: 15, name: "Middle Point", location: { x: 42.9505, y: -85.6705 } as Point },
  { id: 45, regionid: 15, name: "Finish Line", location: { x: 42.9485, y: -85.6685 } as Point },
];

// ============================================================================
// Mock Adventures
// ============================================================================

export const mockAdventures: Adventure[] = [
  // Easy Adventures (2-3 tokens)
  {
    id: 1,
    adventurerid: 1,
    regionid: 1,
    name: "Historic Downtown Walking Tour",
    numtokens: 3,
    location: { x: 42.9634, y: -85.6681 } as Point,
  },
  {
    id: 2,
    adventurerid: 2,
    regionid: 2,
    name: "Peaceful River Walk",
    numtokens: 2,
    location: { x: 42.9704, y: -85.6584 } as Point,
  },
  {
    id: 3,
    adventurerid: 3,
    regionid: 3,
    name: "Campus Discovery",
    numtokens: 3,
    location: { x: 42.9313, y: -85.5881 } as Point,
  },
  {
    id: 4,
    adventurerid: 4,
    regionid: 4,
    name: "Family Forest Fun",
    numtokens: 2,
    location: { x: 42.9245, y: -85.6234 } as Point,
  },
  {
    id: 5,
    adventurerid: 5,
    regionid: 5,
    name: "City Center Scavenger Hunt",
    numtokens: 3,
    location: { x: 42.9616, y: -85.6557 } as Point,
  },
  {
    id: 6,
    adventurerid: 6,
    regionid: 6,
    name: "Lakefront Leisure",
    numtokens: 2,
    location: { x: 42.9789, y: -85.6423 } as Point,
  },

  // Medium Adventures (4-5 tokens)
  {
    id: 7,
    adventurerid: 7,
    regionid: 7,
    name: "Heritage Time Travel",
    numtokens: 4,
    location: { x: 42.9456, y: -85.6789 } as Point,
  },
  {
    id: 8,
    adventurerid: 8,
    regionid: 8,
    name: "Science Explorer Challenge",
    numtokens: 5,
    location: { x: 42.9567, y: -85.6345 } as Point,
  },
  {
    id: 9,
    adventurerid: 9,
    regionid: 9,
    name: "Art Appreciation Quest",
    numtokens: 4,
    location: { x: 42.9678, y: -85.6512 } as Point,
  },
  {
    id: 10,
    adventurerid: 10,
    regionid: 10,
    name: "Athletic Achievement Hunt",
    numtokens: 4,
    location: { x: 42.9389, y: -85.6678 } as Point,
  },
  {
    id: 11,
    adventurerid: 12,
    regionid: 12,
    name: "Garden Paradise Tour",
    numtokens: 4,
    location: { x: 42.9234, y: -85.6456 } as Point,
  },
  {
    id: 12,
    adventurerid: 1,
    regionid: 5,
    name: "Urban Photography Walk",
    numtokens: 5,
    location: { x: 42.9620, y: -85.6560 } as Point,
  },

  // Hard Adventures (6+ tokens)
  {
    id: 13,
    adventurerid: 11,
    regionid: 11,
    name: "Mountain Summit Challenge",
    numtokens: 6,
    location: { x: 42.9812, y: -85.7123 } as Point,
  },
  {
    id: 14,
    adventurerid: 2,
    regionid: 1,
    name: "Ultimate City Explorer",
    numtokens: 7,
    location: { x: 42.9630, y: -85.6685 } as Point,
  },
  {
    id: 15,
    adventurerid: 3,
    regionid: 2,
    name: "Nature Photography Marathon",
    numtokens: 6,
    location: { x: 42.9708, y: -85.6580 } as Point,
  },
  {
    id: 16,
    adventurerid: 4,
    regionid: 3,
    name: "Academic Treasure Hunt",
    numtokens: 6,
    location: { x: 42.9315, y: -85.5885 } as Point,
  },
  {
    id: 17,
    adventurerid: 5,
    regionid: 4,
    name: "Forest Survival Challenge",
    numtokens: 8,
    location: { x: 42.9247, y: -85.6238 } as Point,
  },
  {
    id: 18,
    adventurerid: 6,
    regionid: 6,
    name: "Complete Lakefront Adventure",
    numtokens: 7,
    location: { x: 42.9792, y: -85.6420 } as Point,
  },

  // Cross-region Adventures
  {
    id: 19,
    adventurerid: 7,
    regionid: 1,
    name: "Multi-District Explorer",
    numtokens: 5,
    location: { x: 42.9625, y: -85.6670 } as Point,
  },
  {
    id: 20,
    adventurerid: 8,
    regionid: 8,
    name: "Science and Nature Combo",
    numtokens: 4,
    location: { x: 42.9570, y: -85.6340 } as Point,
  },
  {
    id: 21,
    adventurerid: 9,
    regionid: 7,
    name: "Art and History Journey",
    numtokens: 4,
    location: { x: 42.9460, y: -85.6785 } as Point,
  },
  {
    id: 22,
    adventurerid: 10,
    regionid: 10,
    name: "Sports and Recreation Tour",
    numtokens: 5,
    location: { x: 42.9385, y: -85.6675 } as Point,
  },
  {
    id: 23,
    adventurerid: 11,
    regionid: 11,
    name: "Ultimate Adventure Challenge",
    numtokens: 10,
    location: { x: 42.9815, y: -85.7120 } as Point,
  },
  {
    id: 24,
    adventurerid: 12,
    regionid: 12,
    name: "Beginner Friendly Sampler",
    numtokens: 3,
    location: { x: 42.9230, y: -85.6450 } as Point,
  },

  // User Test Data
  {
    id: 25,
    adventurerid: 1,
    regionid: 13,
    name: "Quick Test Run",
    numtokens: 2,
    location: { x: 42.9300, y: -85.6500 } as Point,
  },
  {
    id: 26,
    adventurerid: 1,
    regionid: 14,
    name: "Demo Adventure",
    numtokens: 3,
    location: { x: 42.9400, y: -85.6600 } as Point,
  },
  {
    id: 27,
    adventurerid: 1,
    regionid: 15,
    name: "First Timer Quest",
    numtokens: 1,
    location: { x: 42.9500, y: -85.6700 } as Point,
  },
  {
    id: 28,
    adventurerid: 1,
    regionid: 13,
    name: "Simple Practice",
    numtokens: 2,
    location: { x: 42.9290, y: -85.6490 } as Point,
  },
];

// ============================================================================
// Mock Tokens
// ============================================================================

export const mockTokens: Token[] = [
  // Adventure 1: Historic Downtown Walking Tour (3 tokens)
  { id: 1, adventureid: 1, location: { x: 42.9628, y: -85.6675 } as Point, hint: "Find the building where city decisions were made for over a century", tokenorder: 1 },
  { id: 2, adventureid: 1, location: { x: 42.9640, y: -85.6687 } as Point, hint: "Look up to see the timekeeper that has watched over downtown for decades", tokenorder: 2 },
  { id: 3, adventureid: 1, location: { x: 42.9622, y: -85.6693 } as Point, hint: "Discover where the past comes alive through exhibits and artifacts", tokenorder: 3 },

  // Adventure 2: Peaceful River Walk (2 tokens)
  { id: 4, adventureid: 2, location: { x: 42.9710, y: -85.6578 } as Point, hint: "Stand where the water meets the sky for the perfect view", tokenorder: 1 },
  { id: 5, adventureid: 2, location: { x: 42.9698, y: -85.6590 } as Point, hint: "Quietly observe nature from this elevated wooden platform", tokenorder: 2 },

  // Adventure 3: Campus Discovery (3 tokens)
  { id: 6, adventureid: 3, location: { x: 42.9307, y: -85.5875 } as Point, hint: "Knowledge seekers gather here among countless books and resources", tokenorder: 1 },
  { id: 7, adventureid: 3, location: { x: 42.9319, y: -85.5887 } as Point, hint: "The heart of student life beats strongest in this central building", tokenorder: 2 },
  { id: 8, adventureid: 3, location: { x: 42.9301, y: -85.5869 } as Point, hint: "Where minds explore the mysteries of the natural world", tokenorder: 3 },

  // Adventure 4: Family Forest Fun (2 tokens)
  { id: 9, adventureid: 4, location: { x: 42.9239, y: -85.6228 } as Point, hint: "This mighty giant has stood guard over the forest for generations", tokenorder: 1 },
  { id: 10, adventureid: 4, location: { x: 42.9251, y: -85.6240 } as Point, hint: "Listen for the sound of cascading water hidden among the trees", tokenorder: 2 },

  // Adventure 5: City Center Scavenger Hunt (3 tokens)
  { id: 11, adventureid: 5, location: { x: 42.9610, y: -85.6551 } as Point, hint: "Water dances in the heart of the city where people gather", tokenorder: 1 },
  { id: 12, adventureid: 5, location: { x: 42.9622, y: -85.6563 } as Point, hint: "Commerce and community come together under one roof", tokenorder: 2 },
  { id: 13, adventureid: 5, location: { x: 42.9604, y: -85.6545 } as Point, hint: "Where deals are made and the economy thrives", tokenorder: 3 },

  // Adventure 6: Lakefront Leisure (2 tokens)
  { id: 14, adventureid: 6, location: { x: 42.9795, y: -85.6417 } as Point, hint: "A beacon of safety guides vessels through the darkness", tokenorder: 1 },
  { id: 15, adventureid: 6, location: { x: 42.9783, y: -85.6429 } as Point, hint: "Feel the sand between your toes where waves meet the shore", tokenorder: 2 },

  // Adventure 7: Heritage Time Travel (4 tokens)
  { id: 16, adventureid: 7, location: { x: 42.9450, y: -85.6783 } as Point, hint: "Where metal was shaped by fire and hammer in days gone by", tokenorder: 1 },
  { id: 17, adventureid: 7, location: { x: 42.9462, y: -85.6795 } as Point, hint: "Young minds once learned their lessons in this one-room wonder", tokenorder: 2 },
  { id: 18, adventureid: 7, location: { x: 42.9444, y: -85.6777 } as Point, hint: "Community faith has been nurtured here for generations", tokenorder: 3 },
  { id: 19, adventureid: 7, location: { x: 42.9456, y: -85.6789 } as Point, hint: "Return to where your journey began in this living history", tokenorder: 4 },

  // Adventure 8: Science Explorer Challenge (5 tokens)
  { id: 20, adventureid: 8, location: { x: 42.9561, y: -85.6339 } as Point, hint: "Reach for the stars in this dome of cosmic wonder", tokenorder: 1 },
  { id: 21, adventureid: 8, location: { x: 42.9573, y: -85.6351 } as Point, hint: "Discover Earth's ancient secrets preserved for all to see", tokenorder: 2 },
  { id: 22, adventureid: 8, location: { x: 42.9555, y: -85.6333 } as Point, hint: "Innovation and technology converge in this modern marvel", tokenorder: 3 },
  { id: 23, adventureid: 8, location: { x: 42.9567, y: -85.6345 } as Point, hint: "Science comes alive through interactive discovery", tokenorder: 4 },
  { id: 24, adventureid: 8, location: { x: 42.9570, y: -85.6348 } as Point, hint: "Complete your scientific journey where it all began", tokenorder: 5 },

  // Adventure 9: Art Appreciation Quest (4 tokens)
  { id: 25, adventureid: 9, location: { x: 42.9672, y: -85.6506 } as Point, hint: "Contemporary creativity flows through these pristine white walls", tokenorder: 1 },
  { id: 26, adventureid: 9, location: { x: 42.9684, y: -85.6518 } as Point, hint: "Art takes three-dimensional form in this outdoor gallery", tokenorder: 2 },
  { id: 27, adventureid: 9, location: { x: 42.9666, y: -85.6500 } as Point, hint: "Color and expression explode across this urban canvas", tokenorder: 3 },
  { id: 28, adventureid: 9, location: { x: 42.9678, y: -85.6512 } as Point, hint: "Artistic inspiration surrounds you in every direction", tokenorder: 4 },

  // Adventure 10: Athletic Achievement Hunt (4 tokens)
  { id: 29, adventureid: 10, location: { x: 42.9383, y: -85.6672 } as Point, hint: "Where champions are crowned and crowds roar with excitement", tokenorder: 1 },
  { id: 30, adventureid: 10, location: { x: 42.9395, y: -85.6684 } as Point, hint: "Love means nothing here, but skill means everything", tokenorder: 2 },
  { id: 31, adventureid: 10, location: { x: 42.9377, y: -85.6666 } as Point, hint: "Dive into victory in these crystal blue lanes", tokenorder: 3 },
  { id: 32, adventureid: 10, location: { x: 42.9389, y: -85.6678 } as Point, hint: "Athletic excellence is celebrated throughout this complex", tokenorder: 4 },

  // Adventure 11: Garden Paradise Tour (4 tokens)
  { id: 33, adventureid: 11, location: { x: 42.9228, y: -85.6450 } as Point, hint: "Beauty and fragrance bloom in thorny perfection", tokenorder: 1 },
  { id: 34, adventureid: 11, location: { x: 42.9240, y: -85.6462 } as Point, hint: "Winged rainbows dance among tropical blooms", tokenorder: 2 },
  { id: 35, adventureid: 11, location: { x: 42.9222, y: -85.6444 } as Point, hint: "Culinary treasures grow in aromatic abundance", tokenorder: 3 },
  { id: 36, adventureid: 11, location: { x: 42.9234, y: -85.6456 } as Point, hint: "Nature's artistry is perfectly cultivated here", tokenorder: 4 },

  // Adventure 12: Urban Photography Walk (5 tokens)
  { id: 37, adventureid: 12, location: { x: 42.9610, y: -85.6551 } as Point, hint: "Capture the perfect shot of urban water artistry", tokenorder: 1 },
  { id: 38, adventureid: 12, location: { x: 42.9622, y: -85.6563 } as Point, hint: "Frame the hustle and bustle of commercial life", tokenorder: 2 },
  { id: 39, adventureid: 12, location: { x: 42.9604, y: -85.6545 } as Point, hint: "Document where business dreams come to life", tokenorder: 3 },
  { id: 40, adventureid: 12, location: { x: 42.9616, y: -85.6557 } as Point, hint: "Show the energy that pulses through city streets", tokenorder: 4 },
  { id: 41, adventureid: 12, location: { x: 42.9620, y: -85.6560 } as Point, hint: "Your photographic journey reaches its perfect conclusion", tokenorder: 5 },

  // Adventure 13: Mountain Summit Challenge (6 tokens)
  { id: 42, adventureid: 13, location: { x: 42.9812, y: -85.7123 } as Point, hint: "Begin your ascent where the trail meets the sky", tokenorder: 1 },
  { id: 43, adventureid: 13, location: { x: 42.9815, y: -85.7120 } as Point, hint: "Halfway up, catch your breath and enjoy the growing view", tokenorder: 2 },
  { id: 44, adventureid: 13, location: { x: 42.9818, y: -85.7117 } as Point, hint: "The world spreads below you from this lofty perch", tokenorder: 3 },
  { id: 45, adventureid: 13, location: { x: 42.9806, y: -85.7129 } as Point, hint: "Soar with the eagles from this rocky outcrop", tokenorder: 4 },
  { id: 46, adventureid: 13, location: { x: 42.9824, y: -85.7105 } as Point, hint: "Rest among ancient pines before the final push", tokenorder: 5 },
  { id: 47, adventureid: 13, location: { x: 42.9821, y: -85.7114 } as Point, hint: "Victory awaits at the summit of your achievement", tokenorder: 6 },

  // Adventure 14: Ultimate City Explorer (7 tokens)
  { id: 48, adventureid: 14, location: { x: 42.9628, y: -85.6675 } as Point, hint: "Begin where civic history was written", tokenorder: 1 },
  { id: 49, adventureid: 14, location: { x: 42.9640, y: -85.6687 } as Point, hint: "Time stands still at this towering landmark", tokenorder: 2 },
  { id: 50, adventureid: 14, location: { x: 42.9622, y: -85.6693 } as Point, hint: "Dive deep into the stories of yesteryear", tokenorder: 3 },
  { id: 51, adventureid: 14, location: { x: 42.9634, y: -85.6681 } as Point, hint: "The heart of downtown beats with endless possibility", tokenorder: 4 },
  { id: 52, adventureid: 14, location: { x: 42.9631, y: -85.6678 } as Point, hint: "Hidden gems await the dedicated explorer", tokenorder: 5 },
  { id: 53, adventureid: 14, location: { x: 42.9637, y: -85.6684 } as Point, hint: "Urban legends come alive in the shadows of history", tokenorder: 6 },
  { id: 54, adventureid: 14, location: { x: 42.9625, y: -85.6688 } as Point, hint: "Complete mastery of the city center awaits", tokenorder: 7 },

  // Adventure 15: Nature Photography Marathon (6 tokens)
  { id: 55, adventureid: 15, location: { x: 42.9710, y: -85.6578 } as Point, hint: "Frame the perfect reflection in still waters", tokenorder: 1 },
  { id: 56, adventureid: 15, location: { x: 42.9698, y: -85.6590 } as Point, hint: "Capture wildlife in their natural habitat", tokenorder: 2 },
  { id: 57, adventureid: 15, location: { x: 42.9716, y: -85.6572 } as Point, hint: "Document where anglers find their peace", tokenorder: 3 },
  { id: 58, adventureid: 15, location: { x: 42.9704, y: -85.6584 } as Point, hint: "The river's story unfolds in every ripple", tokenorder: 4 },
  { id: 59, adventureid: 15, location: { x: 42.9707, y: -85.6581 } as Point, hint: "Nature's palette changes with the shifting light", tokenorder: 5 },
  { id: 60, adventureid: 15, location: { x: 42.9701, y: -85.6587 } as Point, hint: "Your portfolio completes with riverside serenity", tokenorder: 6 },

  // Adventure 16: Academic Treasure Hunt (6 tokens)
  { id: 61, adventureid: 16, location: { x: 42.9307, y: -85.5875 } as Point, hint: "Knowledge begins in the temple of books", tokenorder: 1 },
  { id: 62, adventureid: 16, location: { x: 42.9319, y: -85.5887 } as Point, hint: "Student life converges in this bustling hub", tokenorder: 2 },
  { id: 63, adventureid: 16, location: { x: 42.9301, y: -85.5869 } as Point, hint: "Scientific discovery awaits behind laboratory doors", tokenorder: 3 },
  { id: 64, adventureid: 16, location: { x: 42.9313, y: -85.5881 } as Point, hint: "Academic excellence is forged on these hallowed grounds", tokenorder: 4 },
  { id: 65, adventureid: 16, location: { x: 42.9310, y: -85.5878 } as Point, hint: "Hidden histories lie within ivy-covered walls", tokenorder: 5 },
  { id: 66, adventureid: 16, location: { x: 42.9316, y: -85.5884 } as Point, hint: "Graduation marks the end of this scholarly quest", tokenorder: 6 },

  // Adventure 17: Forest Survival Challenge (8 tokens)
  { id: 67, adventureid: 17, location: { x: 42.9239, y: -85.6228 } as Point, hint: "Seek shelter beneath the ancient guardian oak", tokenorder: 1 },
  { id: 68, adventureid: 17, location: { x: 42.9251, y: -85.6240 } as Point, hint: "Fresh water flows from nature's hidden spring", tokenorder: 2 },
  { id: 69, adventureid: 17, location: { x: 42.9233, y: -85.6222 } as Point, hint: "Find your bearings in the forest's heart", tokenorder: 3 },
  { id: 70, adventureid: 17, location: { x: 42.9245, y: -85.6234 } as Point, hint: "Survival skills are tested in nature's classroom", tokenorder: 4 },
  { id: 71, adventureid: 17, location: { x: 42.9242, y: -85.6231 } as Point, hint: "Forage wisely among the woodland offerings", tokenorder: 5 },
  { id: 72, adventureid: 17, location: { x: 42.9248, y: -85.6237 } as Point, hint: "Create fire where pioneers once warmed themselves", tokenorder: 6 },
  { id: 73, adventureid: 17, location: { x: 42.9236, y: -85.6225 } as Point, hint: "Navigate by stars through the forest canopy", tokenorder: 7 },
  { id: 74, adventureid: 17, location: { x: 42.9254, y: -85.6243 } as Point, hint: "Emerge victorious from the wilderness trial", tokenorder: 8 },

  // Adventure 18: Complete Lakefront Adventure (7 tokens)
  { id: 75, adventureid: 18, location: { x: 42.9795, y: -85.6417 } as Point, hint: "Begin where light guides sailors home", tokenorder: 1 },
  { id: 76, adventureid: 18, location: { x: 42.9783, y: -85.6429 } as Point, hint: "Feel the rhythm of waves on sandy shores", tokenorder: 2 },
  { id: 77, adventureid: 18, location: { x: 42.9801, y: -85.6411 } as Point, hint: "Where vessels begin their aquatic journeys", tokenorder: 3 },
  { id: 78, adventureid: 18, location: { x: 42.9789, y: -85.6423 } as Point, hint: "Lakefront beauty stretches beyond the horizon", tokenorder: 4 },
  { id: 79, adventureid: 18, location: { x: 42.9792, y: -85.6420 } as Point, hint: "Sunset paints the water in golden hues", tokenorder: 5 },
  { id: 80, adventureid: 18, location: { x: 42.9786, y: -85.6426 } as Point, hint: "Seagulls dance above the gentle swells", tokenorder: 6 },
  { id: 81, adventureid: 18, location: { x: 42.9798, y: -85.6414 } as Point, hint: "Complete mastery of the waterfront awaits", tokenorder: 7 },

  // Adventure 23: Ultimate Adventure Challenge (10 tokens) - The most difficult
  { id: 82, adventureid: 23, location: { x: 42.9812, y: -85.7123 } as Point, hint: "The ultimate test begins at the mountain base", tokenorder: 1 },
  { id: 83, adventureid: 23, location: { x: 42.9815, y: -85.7120 } as Point, hint: "Prove your endurance on the climbing trail", tokenorder: 2 },
  { id: 84, adventureid: 23, location: { x: 42.9818, y: -85.7117 } as Point, hint: "Conquer fear at the summit viewpoint", tokenorder: 3 },
  { id: 85, adventureid: 23, location: { x: 42.9806, y: -85.7129 } as Point, hint: "Soar above limitations at Eagle Rock", tokenorder: 4 },
  { id: 86, adventureid: 23, location: { x: 42.9824, y: -85.7105 } as Point, hint: "Find wisdom among the ancient pines", tokenorder: 5 },
  { id: 87, adventureid: 23, location: { x: 42.9821, y: -85.7114 } as Point, hint: "Push beyond physical limits", tokenorder: 6 },
  { id: 88, adventureid: 23, location: { x: 42.9809, y: -85.7126 } as Point, hint: "Mental fortitude is tested here", tokenorder: 7 },
  { id: 89, adventureid: 23, location: { x: 42.9827, y: -85.7108 } as Point, hint: "The spirit of adventure lives in these heights", tokenorder: 8 },
  { id: 90, adventureid: 23, location: { x: 42.9803, y: -85.7132 } as Point, hint: "Few reach this pinnacle of achievement", tokenorder: 9 },
  { id: 91, adventureid: 23, location: { x: 42.9830, y: -85.7102 } as Point, hint: "Ultimate victory belongs to the persistent", tokenorder: 10 },

  // Adventure 24: Beginner Friendly Sampler (3 tokens)
  { id: 92, adventureid: 24, location: { x: 42.9228, y: -85.6450 } as Point, hint: "Start your adventure journey among the roses", tokenorder: 1 },
  { id: 93, adventureid: 24, location: { x: 42.9240, y: -85.6462 } as Point, hint: "Wonder at nature's flying jewels", tokenorder: 2 },
  { id: 94, adventureid: 24, location: { x: 42.9234, y: -85.6456 } as Point, hint: "Complete your first quest in the garden's heart", tokenorder: 3 },

  // User Test Data
  // Adventure 25: Quick Test Run (2 tokens)
  { id: 95, adventureid: 25, location: { x: 42.9295, y: -85.6495 } as Point, hint: "Find Test Point A - look for the sign!", tokenorder: 1 },
  { id: 96, adventureid: 25, location: { x: 42.9305, y: -85.6505 } as Point, hint: "You made it to Test Point B - almost done!", tokenorder: 2 },

  // Adventure 26: Demo Adventure (3 tokens)
  { id: 97, adventureid: 26, location: { x: 42.9395, y: -85.6595 } as Point, hint: "Welcome to Demo Marker 1 - great start!", tokenorder: 1 },
  { id: 98, adventureid: 26, location: { x: 42.9405, y: -85.6605 } as Point, hint: "Demo Marker 2 found - you're doing great!", tokenorder: 2 },
  { id: 99, adventureid: 26, location: { x: 42.9385, y: -85.6585 } as Point, hint: "Demo Marker 3 complete - adventure finished!", tokenorder: 3 },

  // Adventure 27: First Timer Quest (1 token)
  { id: 100, adventureid: 27, location: { x: 42.9495, y: -85.6695 } as Point, hint: "Welcome! This is where all adventures begin!", tokenorder: 1 },

  // Adventure 28: Simple Practice (2 tokens)
  { id: 101, adventureid: 28, location: { x: 42.9290, y: -85.6490 } as Point, hint: "Practice makes perfect - find this easy spot!", tokenorder: 1 },
  { id: 102, adventureid: 28, location: { x: 42.9310, y: -85.6510 } as Point, hint: "Great job! You've completed the practice run!", tokenorder: 2 },
];

// ============================================================================
// Mock Completed Adventures
// ============================================================================

export const mockCompletedAdventures: CompletedAdventure[] = [
  // User 1 completions
  {
    id: 1,
    adventurerid: 1,
    adventureid: 2,
    completiondate: "2024-10-01T00:00:00Z",
    completiontime: "00:45:30",
  },
  {
    id: 2,
    adventurerid: 1,
    adventureid: 4,
    completiondate: "2024-10-03T00:00:00Z",
    completiontime: "00:32:15",
  },
  {
    id: 3,
    adventurerid: 1,
    adventureid: 6,
    completiondate: "2024-10-05T00:00:00Z",
    completiontime: "00:28:45",
  },
  {
    id: 4,
    adventurerid: 1,
    adventureid: 24,
    completiondate: "2024-10-02T00:00:00Z",
    completiontime: "00:25:10",
  },
  
  // User 2 completions
  {
    id: 5,
    adventurerid: 2,
    adventureid: 1,
    completiondate: "2024-10-02T00:00:00Z",
    completiontime: "01:15:20",
  },
  {
    id: 6,
    adventurerid: 2,
    adventureid: 3,
    completiondate: "2024-10-04T00:00:00Z",
    completiontime: "00:52:30",
  },
  {
    id: 7,
    adventurerid: 2,
    adventureid: 5,
    completiondate: "2024-10-06T00:00:00Z",
    completiontime: "01:08:15",
  },
  {
    id: 8,
    adventurerid: 2,
    adventureid: 7,
    completiondate: "2024-10-08T00:00:00Z",
    completiontime: "01:45:50",
  },
  
  // User 3 completions
  {
    id: 9,
    adventurerid: 3,
    adventureid: 8,
    completiondate: "2024-10-07T00:00:00Z",
    completiontime: "02:15:30",
  },
  {
    id: 10,
    adventurerid: 3,
    adventureid: 9,
    completiondate: "2024-10-09T00:00:00Z",
    completiontime: "01:32:45",
  },
  {
    id: 11,
    adventurerid: 3,
    adventureid: 10,
    completiondate: "2024-10-11T00:00:00Z",
    completiontime: "01:58:20",
  },
  
  // User 4 completions
  {
    id: 12,
    adventurerid: 4,
    adventureid: 11,
    completiondate: "2024-10-10T00:00:00Z",
    completiontime: "01:22:10",
  },
  {
    id: 13,
    adventurerid: 4,
    adventureid: 12,
    completiondate: "2024-10-12T00:00:00Z",
    completiontime: "02:05:35",
  },
  {
    id: 14,
    adventurerid: 4,
    adventureid: 24,
    completiondate: "2024-10-08T00:00:00Z",
    completiontime: "00:35:50",
  },
  
  // User 5 completions
  {
    id: 15,
    adventurerid: 5,
    adventureid: 13,
    completiondate: "2024-10-15T00:00:00Z",
    completiontime: "03:45:20",
  },
  {
    id: 16,
    adventurerid: 5,
    adventureid: 14,
    completiondate: "2024-10-18T00:00:00Z",
    completiontime: "02:58:45",
  },
  
  // User 6 completions
  {
    id: 17,
    adventurerid: 6,
    adventureid: 15,
    completiondate: "2024-10-14T00:00:00Z",
    completiontime: "02:22:10",
  },
  {
    id: 18,
    adventurerid: 6,
    adventureid: 16,
    completiondate: "2024-10-16T00:00:00Z",
    completiontime: "02:48:30",
  },
  {
    id: 19,
    adventurerid: 6,
    adventureid: 18,
    completiondate: "2024-10-20T00:00:00Z",
    completiontime: "02:15:45",
  },
  
  // User 7 completions
  {
    id: 20,
    adventurerid: 7,
    adventureid: 1,
    completiondate: "2024-10-13T00:00:00Z",
    completiontime: "01:05:25",
  },
  {
    id: 21,
    adventurerid: 7,
    adventureid: 19,
    completiondate: "2024-10-17T00:00:00Z",
    completiontime: "01:55:40",
  },
  
  // User 8 completions
  {
    id: 22,
    adventurerid: 8,
    adventureid: 20,
    completiondate: "2024-10-19T00:00:00Z",
    completiontime: "01:42:15",
  },
  {
    id: 23,
    adventurerid: 8,
    adventureid: 21,
    completiondate: "2024-10-21T00:00:00Z",
    completiontime: "01:38:50",
  },
  
  // User 9 completions
  {
    id: 24,
    adventurerid: 9,
    adventureid: 22,
    completiondate: "2024-10-22T00:00:00Z",
    completiontime: "02:12:30",
  },
  {
    id: 25,
    adventurerid: 9,
    adventureid: 24,
    completiondate: "2024-10-20T00:00:00Z",
    completiontime: "00:42:20",
  },
  
  // User 10 completions
  {
    id: 26,
    adventurerid: 10,
    adventureid: 23,
    completiondate: "2024-10-25T00:00:00Z",
    completiontime: "04:32:15",
  },
  
  // Additional completions for testing
  {
    id: 27,
    adventurerid: 11,
    adventureid: 1,
    completiondate: "2024-10-26T00:00:00Z",
    completiontime: "01:12:45",
  },
  {
    id: 28,
    adventurerid: 11,
    adventureid: 2,
    completiondate: "2024-10-27T00:00:00Z",
    completiontime: "00:48:30",
  },
  {
    id: 29,
    adventurerid: 12,
    adventureid: 3,
    completiondate: "2024-10-28T00:00:00Z",
    completiontime: "00:58:20",
  },
  {
    id: 30,
    adventurerid: 12,
    adventureid: 4,
    completiondate: "2024-10-29T00:00:00Z",
    completiontime: "00:41:15",
  },
  {
    id: 31,
    adventurerid: 13,
    adventureid: 5,
    completiondate: "2024-10-30T00:00:00Z",
    completiontime: "01:18:40",
  },
  {
    id: 32,
    adventurerid: 14,
    adventureid: 6,
    completiondate: "2024-10-31T00:00:00Z",
    completiontime: "00:52:25",
  },
  {
    id: 33,
    adventurerid: 15,
    adventureid: 24,
    completiondate: "2024-11-01T00:00:00Z",
    completiontime: "00:38:10",
  },
  
  // User Test Data
  {
    id: 34,
    adventurerid: 16,
    adventureid: 27,
    completiondate: "2024-11-27T00:00:00Z",
    completiontime: "00:05:30",
  },
  {
    id: 35,
    adventurerid: 16,
    adventureid: 25,
    completiondate: "2024-11-27T00:00:00Z",
    completiontime: "00:08:15",
  },
  {
    id: 36,
    adventurerid: 16,
    adventureid: 28,
    completiondate: "2024-11-27T00:00:00Z",
    completiontime: "00:06:45",
  },
  {
    id: 37,
    adventurerid: 16,
    adventureid: 26,
    completiondate: "2024-11-27T00:00:00Z",
    completiontime: "00:12:20",
  },
];

// ============================================================================
// Mock Adventures with Regions (Composed Data)
// ============================================================================

export const mockAdventuresWithRegions: AdventureWithRegion[] = mockAdventures.map((adventure) => {
  const region = mockRegions.find((r) => r.id === adventure.regionid);
  if (!region) {
    throw new Error(`Region not found for adventure ${adventure.id}`);
  }
  return {
    ...adventure,
    region,
  };
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get adventures for a specific region
 */
export function getAdventuresByRegion(regionId: number): Adventure[] {
  return mockAdventures.filter((adv) => adv.regionid === regionId);
}

/**
 * Get tokens for a specific adventure
 */
export function getTokensByAdventure(adventureId: number): Token[] {
  return mockTokens.filter((token) => token.adventureid === adventureId);
}

/**
 * Get landmarks for a specific region
 */
export function getLandmarksByRegion(regionId: number): Landmark[] {
  return mockLandmarks.filter((landmark) => landmark.regionid === regionId);
}

/**
 * Get completed adventures for a specific user
 */
export function getCompletedAdventuresByUser(adventurerId: number): CompletedAdventure[] {
  return mockCompletedAdventures.filter((ca) => ca.adventurerid === adventurerId);
}

/**
 * Get regions created by a specific user
 */
export function getRegionsByCreator(adventurerId: number): Region[] {
  return mockRegions.filter((region) => region.adventurerid === adventurerId);
}

/**
 * Get adventures created by a specific user
 */
export function getAdventuresByCreator(adventurerId: number): Adventure[] {
  return mockAdventures.filter((adventure) => adventure.adventurerid === adventurerId);
}

/**
 * Find user by username and password (for mock login)
 */
export function authenticateUser(username: string, password: string): Adventurer | null {
  const user = mockAdventurers.find(
    (adv) => adv.username === username && adv.password === password
  );
  return user || null;
}

/**
 * Get adventure with all related data
 */
export function getCompleteAdventure(adventureId: number) {
  const adventure = mockAdventures.find((adv) => adv.id === adventureId);
  if (!adventure) return null;

  const region = mockRegions.find((r) => r.id === adventure.regionid);
  const tokens = getTokensByAdventure(adventureId);
  const landmarks = region ? getLandmarksByRegion(region.id) : [];
  const creator = mockAdventurers.find((adv) => adv.id === adventure.adventurerid);

  return {
    ...adventure,
    region,
    tokens,
    landmarks,
    creator,
  };
}

// ============================================================================
// Export all mock data
// ============================================================================

export const mockData = {
  adventurers: mockAdventurers,
  regions: mockRegions,
  landmarks: mockLandmarks,
  adventures: mockAdventures,
  tokens: mockTokens,
  completedAdventures: mockCompletedAdventures,
  adventuresWithRegions: mockAdventuresWithRegions,
};
