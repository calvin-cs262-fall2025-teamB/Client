export interface HelpContent {
  title: string;
  sections: {
    heading: string;
    content: string;
    tips?: string[];
  }[];
}

export const helpContent: Record<string, HelpContent> = {
  // Add help content for each page here
  // Example structure:
  // map: {
  //   title: "Map Navigation Guide",
  //   sections: [
  //     {
  //       heading: "View Modes",
  //       content: "Toggle between different view modes...",
  //       tips: ["Tip 1", "Tip 2"]
  //     }
  //   ]
  // }
};