export interface HelpContent {
  title: string;
  sections: {
    heading: string;
    content: string;
    tips?: string[];
  }[];
}

export const helpContent: Record<string, HelpContent> = {
  login: {
    title: "Login Help",
    sections: [
      {
        heading: "Getting Started",
        content: "Enter your username and password to access your WayFind account. If you don't have an account yet, tap 'Sign Up' to create one.",
        tips: [
          "Usernames can only contain letters, numbers, underscores, and hyphens",
          "Passwords must be at least 10 characters and contain letters and numbers"
        ]
      },
      {
        heading: "Security Notice",
        content: "For demonstration purposes, passwords are not encrypted. Please do not use sensitive or reused passwords.",
      },
      {
        heading: "Troubleshooting",
        content: "If you're having trouble logging in, check that your username and password meet the requirements.",
      }
    ]
  },
  home: {
    title: "Home Page Guide",
    sections: [
      {
        heading: "Discovering Adventures",
        content: "Browse available adventures in your area. Use the search bar to find specific adventures or filter by region.",
        tips: [
          "Tap on an adventure card to see more details",
          "Use filters to narrow down adventures by region",
          "Clear filters to see all available adventures"
        ]
      },
      {
        heading: "Search and Filters",
        content: "Use the search bar at the top to find adventures by name. Apply region filters to see adventures in specific areas.",
      },
      {
        heading: "Starting an Adventure",
        content: "Tap on any adventure card to view details and start your quest. Make sure you're in the right location before beginning.",
      }
    ]
  },
  map: {
    title: "Map Navigation Guide",
    sections: [
      {
        heading: "View Modes",
        content: "Toggle between 'Regions' and 'Adventures' using the buttons at the top of the screen to see different types of content.",
        tips: [
          "Regions mode shows nearby regions",
          "Adventures mode displays nearby adventures",
        ]
      },
      {
        heading: "Regions vs Adventures",
        content: "Regions are enclosed areas that contain landmarks.  Adventures are playable quests where you are tasked with collecting tokens.",
        tips: [
          "Landmark: Visible geographical location.  Landmarks Appear on the map when playing an adventure.",
          "Token: Hidden gegographical location.  Tokens are collected when you are close enough to the geographical location."
        ]
      },
      {
        heading: "Interacting with Map",
        content: "Tap on markers to select them. Selected regions will show a green highlight circle and reveal landmarks.",
        tips: [
          "Green pins = Regions",
          "Blue pins = Adventures",
          "Orange pins = Landmarks (when region selected)"
        ]
      },
      {
        heading: "Starting Adventures",
        content: "Select an adventure marker, then tap the 'Play' button that appears at the bottom to begin your quest.",
      }
    ]
  },
  profile: {
    title: "Profile Management",
    sections: [
      {
        heading: "Your Stats",
        content: "View your adventure statistics including completed quests, collected tokens, and overall progress.",
        tips: [
          "Tokens are earned by completing adventures",
          "Track your progress over time"
        ]
      },
      {
        heading: "Profile Customization",
        content: "Update your profile picture, display name, and other personal information to personalize your WayFind experience.",
      },
      {
        heading: "Adventure History",
        content: "Review all the adventures you've completed, including when you finished them and any achievements earned.",
      },
      {
        heading: "Account Management",
        content: "Access account settings and logout options from your profile page.",
      }
    ]
  },
  creator: {
    title: "Content Creation Guide",
    sections: [
      {
        heading: "Creating Regions",
        content: "Design new geographical areas for adventures.  When creating a region, first you will need to set the region center.  Once the region center is confirmed, the region radius is then set.  Once the region radius is set, landmarks can be placed at the user's location.",
        tips: [
          "Landmarks must be placed at the user's location (to ensure that they are accessible)",
          "Do not place landmarks in inaccessible or restricted areas"
        ]
      },
      {
        heading: "Creating Adventures",
        content: "Create engaging adventures for other users to discover and complete in your regions.  When creating an adventure, select a region in which it will be set.  Once a region is set, tokens can be placed at the user's location.",
        tips: [
          "Tokens must be placed at the user's location (to ensure that they are accessible)",
          "Do not place tokens in inaccessible or restricted areas"
        ]
      },
      {
        heading: "Publishing Content",
        content: "Once your regions and adventures are ready, you can publish them for other WayFind users to explore.",
      },
      {
        heading: "Content Guidelines",
        content: "Ensure your content is appropriate, safe, and accessible. Avoid private property or dangerous locations.",
      }
    ]
  },
  createAdventure: {
    title: "Create Adventure Guide",
    sections: [
      {
        heading: "Adventure Planning",
        content: "Create engaging location-based adventures for other users to discover. Start by giving your adventure a name and selecting a region.",
        tips: [
          "Choose descriptive names that hint at the adventure's theme",
          "Adventure names can be up to 100 characters long",
          "Select regions you're familiar with for better content creation"
        ]
      },
      {
        heading: "Region Selection",
        content: "Choose from available regions where your adventure will take place. Regions must be created first before you can create an adventure.",
        tips: [
          "If no regions are available, create one first from the Creator tab",
          "Consider the region's size and landmarks when planning your adventure",
          "Each adventure belongs to exactly one region"
        ]
      },
      {
        heading: "Next Steps",
        content: "After completing the basic details, you'll proceed to the map where you can place tokens and add clues for players to discover.",
      }
    ]
  },
  createAdventureMap: {
    title: "Adventure Map Guide",
    sections: [
      {
        heading: "Token Placement",
        content: "Place tokens at specific locations within your selected region. Players will need to physically visit these locations to progress through your adventure.",
        tips: [
          "Tokens will be collected in the order at which they are placed",
          "Use the 'Add Token' button to place tokens at your current location",
          "Add meaningful hints to help players find each token",
          "Ensure tokens are placed in accessible, public locations"
        ]
      },
      {
        heading: "Adding Hints",
        content: "Each token requires a hint that will guide players to its location. Good hints are specific enough to be helpful but not too obvious.",
        tips: [
          "Reference nearby landmarks or distinctive features",
          "Consider what players will see when they arrive",
          "Avoid hints that require special knowledge or access"
        ]
      },
      {
        heading: "Map Elements",
        content: "The map shows your region boundary (green circle), landmarks (orange pins), and your placed tokens (blue pins). The green circle indicates the playable area.",
      },
      {
        heading: "Safety Guidelines",
        content: "Always place tokens in safe, publicly accessible locations. Avoid private property, dangerous areas, or locations that require special permissions.",
      }
    ]
  },
  createRegion: {
    title: "Region Creation Guide",
    sections: [
      {
        heading: "Region Basics",
        content: "Regions define geographical areas containing landmarks where adventures can take place. Click the Create Region button to begin.",
        tips: [
          "Choose areas you know well for better region design",
          "Consider accessibility for all potential players",
          "Regions should be large enough for interesting adventures"
        ]
      },
      {
        heading: "Placing Your Region",
        content: "After giving your region a name, tap the map to place your region's center point. This will be the focal point around which your circular region is defined.",
        tips: [
          "Choose central locations within your intended area",
          "Consider parking and public transportation access",
          "The center cannot be repositioned once confirmed"
        ]
      },
      {
        heading: "Adjusting Region Size",
        content: "Drag on the map to adjust your region's radius. The circle shows the boundary where landmarks can be placed.",
        tips: [
          "Minimum radius: 50 meters",
          "Maximum radius: 5000 meters (5km)",
          "Larger regions allow for more diverse adventures",
          "The map cannot be panned while adjusting the region size"
        ]
      },
      {
        heading: "Adding Landmarks",
        content: "Place landmarks at notable points of interest within your region. These help orient players and can serve as reference points for adventures.",
        tips: [
          "Add landmarks at recognizable features",
          "Include variety: buildings, natural features, public art",
          "Auto-generation is available if you skip manual placement",
          "Landmarks can be deleted by clicking and removing them"
        ]
      }
    ]
  }
};