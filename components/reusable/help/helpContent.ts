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
  }
  // Add more help content for other pages here
};