import {
  getAdventuresByCreator,
  mockData,
} from "@/data/mockData";
import {
  Adventure,
  Adventurer,
  CompletedAdventure,
  CreateAdventure,
  CreateAdventurer,
  CreateCompletedAdventure,
  CreateLandmark,
  CreateRegion,
  CreateToken,
  Landmark,
  Point,
  Region,
  Token,
  UpdateAdventurer
} from "@/types/database";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

// Entity type for loading/error state tracking
type EntityType =
  | "adventurers"
  | "regions"
  | "landmarks"
  | "adventures"
  | "tokens"
  | "completedAdventures";

// Loading states interface
interface LoadingStates {
  adventurers: boolean;
  regions: boolean;
  landmarks: boolean;
  adventures: boolean;
  tokens: boolean;
  completedAdventures: boolean;
}

// Error states interface
interface ErrorStates {
  adventurers: string | null;
  regions: string | null;
  landmarks: string | null;
  adventures: string | null;
  tokens: string | null;
  completedAdventures: string | null;
}

// Last updated timestamps interface
interface LastUpdatedStates {
  adventurers: string | null;
  regions: string | null;
  landmarks: string | null;
  adventures: string | null;
  tokens: string | null;
  completedAdventures: string | null;
}

// Database state interface
interface DatabaseState {
  // Entity data
  adventurers: Adventurer[];
  regions: Region[];
  landmarks: Landmark[];
  adventures: Adventure[];
  tokens: Token[];
  completedAdventures: CompletedAdventure[];

  // Loading states
  loading: LoadingStates;

  // Error states
  errors: ErrorStates;

  // Cache timestamps for data freshness
  lastUpdated: LastUpdatedStates;
}

// Action types
type DatabaseAction =
  | { type: "SET_LOADING"; entity: EntityType; isLoading: boolean }
  | { type: "SET_ADVENTURERS"; data: Adventurer[] }
  | { type: "SET_REGIONS"; data: Region[] }
  | { type: "SET_LANDMARKS"; data: Landmark[] }
  | { type: "SET_ADVENTURES"; data: Adventure[] }
  | { type: "SET_TOKENS"; data: Token[] }
  | { type: "SET_COMPLETED_ADVENTURES"; data: CompletedAdventure[] }
  | { type: "ADD_ADVENTURER"; data: Adventurer }
  | { type: "UPDATE_ADVENTURER"; data: Adventurer }
  | { type: "ADD_REGION"; data: Region }
  | { type: "UPDATE_REGION"; data: Region }
  | { type: "ADD_LANDMARK"; data: Landmark }
  | { type: "ADD_ADVENTURE"; data: Adventure }
  | { type: "UPDATE_ADVENTURE"; data: Adventure }
  | { type: "ADD_TOKEN"; data: Token }
  | { type: "ADD_COMPLETED_ADVENTURE"; data: CompletedAdventure }
  | { type: "SET_ERROR"; entity: EntityType; error: string }
  | { type: "CLEAR_ERROR"; entity: EntityType };

// Context value interface
interface DatabaseContextValue extends DatabaseState {
  // Fetch functions
  fetchAdventurers: () => Promise<Adventurer[] | undefined>;
  fetchRegions: () => Promise<Region[] | undefined>;
  fetchLandmarks: (regionid?: number | null) => Promise<Landmark[] | undefined>;
  fetchAdventures: (
    regionid?: number | null,
    adventurerid?: number | null
  ) => Promise<Adventure[] | undefined>;
  fetchCompletedAdventures: (adventurerid: number) => Promise<CompletedAdventure[] | undefined>;

  // Create/Update functions
  createAdventurer: (adventurerData: CreateAdventurer) => Promise<Adventurer>;
  updateAdventurer: (
    id: number,
    adventurerData: Omit<UpdateAdventurer, 'id'>
  ) => Promise<Adventurer>;
  createRegion: (regionData: CreateRegion) => Promise<Region>;
  createLandmark: (landmarkData: CreateLandmark) => Promise<Landmark>;
  createAdventure: (
    adventureData: CreateAdventure
  ) => Promise<Adventure>;
  createToken: (tokenData: CreateToken) => Promise<Token>;
  completeAdventure: (
    completionData: CreateCompletedAdventure
  ) => Promise<CompletedAdventure>;

  // Helper functions
  getAdventuresByRegion: (regionid: number) => Adventure[];
  getTokensByAdventure: (adventureid: number) => Token[];
  getCompletedAdventuresByUser: (adventurerid: number) => CompletedAdventure[];
  getLandmarksByRegion: (regionid: number) => Landmark[];

  // Utility functions
  clearError: (entity: EntityType) => void;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(
  undefined
);

// Initial state structure
const initialState: DatabaseState = {
  // Entity data
  adventurers: [],
  regions: [],
  landmarks: [],
  adventures: [],
  tokens: [],
  completedAdventures: [],

  // Loading states
  loading: {
    adventurers: false,
    regions: false,
    landmarks: false,
    adventures: false,
    tokens: false,
    completedAdventures: false,
  },

  // Error states
  errors: {
    adventurers: null,
    regions: null,
    landmarks: null,
    adventures: null,
    tokens: null,
    completedAdventures: null,
  },

  // Cache timestamps for data freshness
  lastUpdated: {
    adventurers: null,
    regions: null,
    landmarks: null,
    adventures: null,
    tokens: null,
    completedAdventures: null,
  },
};

// Reducer function
function databaseReducer(
  state: DatabaseState,
  action: DatabaseAction
): DatabaseState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: action.isLoading,
        },
      };

    case "SET_ADVENTURERS":
      return {
        ...state,
        adventurers: action.data,
        loading: { ...state.loading, adventurers: false },
        errors: { ...state.errors, adventurers: null },
        lastUpdated: {
          ...state.lastUpdated,
          adventurers: new Date().toISOString(),
        },
      };

    case "SET_REGIONS":
      return {
        ...state,
        regions: action.data,
        loading: { ...state.loading, regions: false },
        errors: { ...state.errors, regions: null },
        lastUpdated: {
          ...state.lastUpdated,
          regions: new Date().toISOString(),
        },
      };

    case "SET_LANDMARKS":
      return {
        ...state,
        landmarks: action.data,
        loading: { ...state.loading, landmarks: false },
        errors: { ...state.errors, landmarks: null },
        lastUpdated: {
          ...state.lastUpdated,
          landmarks: new Date().toISOString(),
        },
      };

    case "SET_ADVENTURES":
      return {
        ...state,
        adventures: action.data,
        loading: { ...state.loading, adventures: false },
        errors: { ...state.errors, adventures: null },
        lastUpdated: {
          ...state.lastUpdated,
          adventures: new Date().toISOString(),
        },
      };

    case "SET_TOKENS":
      return {
        ...state,
        tokens: action.data,
        loading: { ...state.loading, tokens: false },
        errors: { ...state.errors, tokens: null },
        lastUpdated: { ...state.lastUpdated, tokens: new Date().toISOString() },
      };

    case "SET_COMPLETED_ADVENTURES":
      return {
        ...state,
        completedAdventures: action.data,
        loading: { ...state.loading, completedAdventures: false },
        errors: { ...state.errors, completedAdventures: null },
        lastUpdated: {
          ...state.lastUpdated,
          completedAdventures: new Date().toISOString(),
        },
      };

    case "ADD_ADVENTURER":
      return {
        ...state,
        adventurers: [...state.adventurers, action.data],
      };

    case "UPDATE_ADVENTURER":
      return {
        ...state,
        adventurers: state.adventurers.map((adventurer) =>
          adventurer.id === action.data.id
            ? { ...adventurer, ...action.data }
            : adventurer
        ),
      };

    case "ADD_REGION":
      return {
        ...state,
        regions: [...state.regions, action.data],
      };

    case "ADD_LANDMARK":
      return {
        ...state,
        landmarks: [...state.landmarks, action.data],
      };

    case "ADD_ADVENTURE":
      return {
        ...state,
        adventures: [...state.adventures, action.data],
      };

    case "ADD_TOKEN":
      return {
        ...state,
        tokens: [...state.tokens, action.data],
      };

    case "ADD_COMPLETED_ADVENTURE":
      return {
        ...state,
        completedAdventures: [...state.completedAdventures, action.data],
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.entity]: action.error,
        },
        loading: {
          ...state.loading,
          [action.entity]: false,
        },
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.entity]: null,
        },
      };

    default:
      return state;
  }
}

interface DatabaseProviderProps {
  children: ReactNode;
}

// DatabaseProvider component
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [state, dispatch] = useReducer(databaseReducer, initialState);

  // Helper function to format location objects as PostgreSQL points
  const formatLocationForPostgreSQL = (location: Point | null | undefined): string | null => {
    if (
      !location ||
      typeof location.x !== "number" ||
      typeof location.y !== "number"
    ) {
      return null;
    }
    return `(${location.x},${location.y})`;
  };

  // Base API URL - using your working Azure service
  const API_BASE_URL =
    "https://beautifulguys-bsayggeve3c6esba.canadacentral-01.azurewebsites.net";

  // Generic API call function with React Native network handling
  const apiCall = useCallback(
    async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const defaultOptions: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Add headers that help with React Native networking
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          ...options.headers,
        },
      };

      const fullUrl = `${API_BASE_URL}${endpoint}`;

      try {
        // Add timeout for React Native
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(fullUrl, {
          ...defaultOptions,
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorText = "No error details available";
          try {
            errorText = await response.text();
          } catch (e) {
            console.log("Could not read error response body");
          }

          if (__DEV__) {
            // console.log('Error response body:', errorText);
          }
          throw new Error(
            `HTTP ${response.status}: ${response.statusText} - ${errorText}`
          );
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          return data as T;
        } else {
          const text = await response.text();
          if (__DEV__) {
            // console.log('Non-JSON response received:', text);
          }
          // Try to parse as JSON anyway
          try {
            return JSON.parse(text) as T;
          } catch (e) {
            throw new Error("Response is not valid JSON");
          }
        }
      } catch (fetchError) {
        if (__DEV__) {
          console.log("Fetch error type:", (fetchError as Error).name);
          console.log("Fetch error message:", (fetchError as Error).message);
          console.log("Full fetch error:", fetchError);

          if ((fetchError as Error).name === "AbortError") {
            console.log("Request timed out after 10 seconds");
          } else if (
            (fetchError as Error).message.includes("Network request failed")
          ) {
            console.log(
              "Network connectivity issue - check if you can access the URL in a browser"
            );
          }
        }
        throw fetchError;
      }
    },
    [API_BASE_URL]
  );

  /* Data fetching functions */

  const fetchAdventurers = useCallback(async (): Promise<Adventurer[] | undefined> => {
    dispatch({
      type: "SET_LOADING",
      entity: "adventurers",
      isLoading: true,
    });
    try {
      const fullUrl = `${API_BASE_URL}/adventurers`;

      const data = await apiCall<Adventurer[]>("/adventurers");

      // Ensure data is an array
      const adventurersArray = Array.isArray(data) ? data : [];
      dispatch({ type: "SET_ADVENTURERS", data: adventurersArray });
      return data;
    } catch (error) {
      if (__DEV__) {
        console.log("Backend unavailable - using mock adventurers data");
      }

      // Fallback to mock data if fetch fails
      dispatch({ type: "SET_ADVENTURERS", data: mockData.adventurers });
      // Clear any existing errors since fallback was successful
      dispatch({
        type: "CLEAR_ERROR",
        entity: "adventurers",
      });
    }
  }, [apiCall, API_BASE_URL]);

  const fetchRegions = useCallback(async (): Promise<Region[] | undefined> => {
    dispatch({
      type: "SET_LOADING",
      entity: "regions",
      isLoading: true,
    });
    try {
      const data = await apiCall<Region[]>("/regions");
      dispatch({ type: "SET_REGIONS", data });
      return data;
    } catch (error) {
      if (__DEV__) {
        console.log("Backend unavailable - using mock regions data");
      }
      // Fallback to mock data if fetch fails
      dispatch({ type: "SET_REGIONS", data: mockData.regions });
      // Clear any existing errors since fallback was successful
      dispatch({
        type: "CLEAR_ERROR",
        entity: "regions",
      });
      return mockData.regions;
    }
  }, [apiCall]);

  const fetchLandmarks = useCallback(
    async (regionid: number | null = null): Promise<Landmark[] | undefined> => {
      dispatch({
        type: "SET_LOADING",
        entity: "landmarks",
        isLoading: true,
      });
      try {
        const endpoint = regionid
          ? `/landmarks?regionid=${regionid}`
          : "/landmarks";
        const data = await apiCall<Landmark[]>(endpoint);
        dispatch({ type: "SET_LANDMARKS", data });
        return data;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - using mock landmarks data");
        }
        // Fallback to mock data if fetch fails
        const fallbackData = regionid
          ? getLandmarksByRegion(regionid)
          : mockData.landmarks;
        dispatch({ type: "SET_LANDMARKS", data: fallbackData });
        // Clear any existing errors since fallback was successful
        dispatch({
          type: "CLEAR_ERROR",
          entity: "landmarks",
        });
        return fallbackData;
      }
    },
    [apiCall]
  );

  const fetchAdventures = useCallback(
    async (
      regionid: number | null = null,
      adventurerid: number | null = null
    ): Promise<Adventure[] | undefined> => {
      dispatch({
        type: "SET_LOADING",
        entity: "adventures",
        isLoading: true,
      });
      try {
        let endpoint = "/adventures";
        const params = new URLSearchParams();
        // Use lowercase for query parameters (matches PostgreSQL conventions)
        if (regionid) params.append("regionid", regionid.toString());
        if (adventurerid) params.append("adventurerid", adventurerid.toString());
        if (params.toString()) endpoint += `?${params.toString()}`;

        const data = await apiCall<Adventure[]>(endpoint);
        dispatch({ type: "SET_ADVENTURES", data });
        return data;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - using mock adventures data");
        }
        // Fallback to mock data if fetch fails
        let fallbackData = mockData.adventures;
        if (regionid) {
          fallbackData = getAdventuresByRegion(regionid);
        } else if (adventurerid) {
          fallbackData = getAdventuresByCreator(adventurerid);
        }
        dispatch({ type: "SET_ADVENTURES", data: fallbackData });
        // Clear any existing errors since fallback was successful
        dispatch({
          type: "CLEAR_ERROR",
          entity: "adventures",
        });
        return fallbackData;
      }
    },
    [apiCall]
  );

  const fetchCompletedAdventures = useCallback(
    async (adventurerid: number): Promise<CompletedAdventure[] | undefined> => {
      dispatch({
        type: "SET_LOADING",
        entity: "completedAdventures",
        isLoading: true,
      });
      try {
        if (__DEV__) {
          console.log(
            "Fetching completed adventures for adventurer:",
            adventurerid
          );
        }

        const data = await apiCall<CompletedAdventure[]>(
          `/completedAdventures/adventurer/${adventurerid}`
        );

        if (__DEV__) {
          console.log("Completed adventures response:", data);
          console.log(
            "Completed adventures type:",
            typeof data,
            Array.isArray(data)
          );
          if (data && data.length > 0) {
            console.log("Sample completed adventure:", data[0]);
            console.log("Available fields:", Object.keys(data[0]));
          } else {
            console.log(
              "No completed adventures found for user:",
              adventurerid
            );
          }
        }

        // Ensure data is an array
        const completedArray = Array.isArray(data) ? data : [];
        dispatch({
          type: "SET_COMPLETED_ADVENTURES",
          data: completedArray,
        });
        return completedArray;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - using mock completed adventures data");
        }
        // Fallback to mock data if fetch fails
        const fallbackData = adventurerid
          ? getCompletedAdventuresByUser(adventurerid)
          : mockData.completedAdventures;
        dispatch({
          type: "SET_COMPLETED_ADVENTURES",
          data: fallbackData,
        });
        // Clear any existing errors since fallback was successful
        dispatch({
          type: "CLEAR_ERROR",
          entity: "completedAdventures",
        });
        return fallbackData;
      }
    },
    [apiCall]
  );

  // Create/Update functions
  const createAdventurer = useCallback(
    async (adventurerData: CreateAdventurer): Promise<Adventurer> => {
      try {
        const data = await apiCall<Adventurer>("/adventurers", {
          method: "POST",
          body: JSON.stringify(adventurerData),
        });
        dispatch({ type: "ADD_ADVENTURER", data });
        return data;
      } catch (error) {
        // Fallback: Create mock user for offline/development use
        if (__DEV__) {
          console.log("Backend unavailable - creating mock user for development");
        }
        const mockUser: Adventurer = {
          id: Math.floor(Math.random() * 10000) + 1000, // Random ID
          username: adventurerData.username,
          password: adventurerData.password,
          profilepicture: adventurerData.profilepicture || null,
        };
        dispatch({ type: "ADD_ADVENTURER", data: mockUser });
        return mockUser;
      }
    },
    [apiCall]
  );

  const updateAdventurer = useCallback(
    async (
      id: number,
      adventurerData: Omit<UpdateAdventurer, 'id'>
    ): Promise<Adventurer> => {
      try {
        const data = await apiCall<Adventurer>(`/adventurers/${id}`, {
          method: "PUT",
          body: JSON.stringify(adventurerData),
        });
        dispatch({ type: "UPDATE_ADVENTURER", data });
        return data;
      } catch (error) {
        console.error("Error updating adventurer:", error);
        throw error;
      }
    },
    [apiCall]
  );

  const createRegion = useCallback(
    async (regionData: CreateRegion): Promise<Region> => {
      try {
        // Format location for PostgreSQL point type
        const formattedData = {
          ...regionData,
          location: formatLocationForPostgreSQL(regionData.location),
        };

        const data = await apiCall<Region>("/regions", {
          method: "POST",
          body: JSON.stringify(formattedData),
        });
        dispatch({ type: "ADD_REGION", data });
        return data;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - creating mock region for development");
        }

        // Fallback: Create mock region for offline/development use
        const mockRegion: Region = {
          id: Math.floor(Math.random() * 10000) + 1000,
          adventurerid: regionData.adventurerid,
          name: regionData.name,
          description: regionData.description || null,
          location: regionData.location,
          radius: regionData.radius,
        };
        dispatch({ type: "ADD_REGION", data: mockRegion });
        return mockRegion;
      }
    },
    [apiCall]
  );

  const createLandmark = useCallback(
    async (landmarkData: CreateLandmark): Promise<Landmark> => {
      try {
        // Format location for PostgreSQL point type
        const formattedData = {
          ...landmarkData,
          location: formatLocationForPostgreSQL(landmarkData.location),
        };

        const data = await apiCall<Landmark>("/landmarks", {
          method: "POST",
          body: JSON.stringify(formattedData),
        });
        dispatch({ type: "ADD_LANDMARK", data });
        return data;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - creating mock landmark for development");
        }

        // Fallback: Create mock landmark for offline/development use
        const mockLandmark: Landmark = {
          id: Math.floor(Math.random() * 10000) + 1000,
          regionid: landmarkData.regionid,
          name: landmarkData.name,
          location: landmarkData.location,
        };
        dispatch({ type: "ADD_LANDMARK", data: mockLandmark });
        return mockLandmark;
      }
    },
    [apiCall]
  );

  const createAdventure = useCallback(
    async (adventureData: CreateAdventure): Promise<Adventure> => {
      try {
        // Format location for PostgreSQL point type
        const formattedData = {
          ...adventureData,
          location: formatLocationForPostgreSQL(adventureData.location),
        };

        const data = await apiCall<Adventure>("/adventures", {
          method: "POST",
          body: JSON.stringify(formattedData),
        });
        dispatch({ type: "ADD_ADVENTURE", data });
        return data;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - creating mock adventure for development");
        }

        // Fallback: Create mock adventure for offline/development use
        const mockAdventure: Adventure = {
          id: Math.floor(Math.random() * 10000) + 1000,
          adventurerid: adventureData.adventurerid,
          regionid: adventureData.regionid,
          name: adventureData.name,
          numtokens: adventureData.numtokens,
          location: adventureData.location,
        };
        dispatch({ type: "ADD_ADVENTURE", data: mockAdventure });
        return mockAdventure;
      }
    },
    [apiCall]
  );

  const createToken = useCallback(
    async (tokenData: CreateToken): Promise<Token> => {
      try {
        // Format location for PostgreSQL point type
        const formattedData = {
          ...tokenData,
          location: formatLocationForPostgreSQL(tokenData.location),
        };

        const data = await apiCall<Token>("/tokens", {
          method: "POST",
          body: JSON.stringify(formattedData),
        });
        dispatch({ type: "ADD_TOKEN", data });
        return data;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - creating mock token for development");
        }

        // Fallback: Create mock token for offline/development use
        const mockToken: Token = {
          id: Math.floor(Math.random() * 10000) + 1000,
          adventureid: tokenData.adventureid,
          location: tokenData.location,
          hint: tokenData.hint || null,
          tokenorder: tokenData.tokenorder || null,
        };
        dispatch({ type: "ADD_TOKEN", data: mockToken });
        return mockToken;
      }
    },
    [apiCall]
  );

  const completeAdventure = useCallback(
    async (
      completionData: CreateCompletedAdventure
    ): Promise<CompletedAdventure> => {
      try {
        const data = await apiCall<CompletedAdventure>("/completed-adventures", {
          method: "POST",
          body: JSON.stringify(completionData),
        });
        dispatch({ type: "ADD_COMPLETED_ADVENTURE", data });
        return data;
      } catch (error) {
        if (__DEV__) {
          console.log("Backend unavailable - marking adventure as completed locally");
        }

        // Fallback: Create mock completion for offline/development use
        const mockCompletion: CompletedAdventure = {
          id: Math.floor(Math.random() * 10000) + 1000,
          adventurerid: completionData.adventurerid,
          adventureid: completionData.adventureid,
          completiondate: completionData.completiondate || new Date().toISOString(),
          completiontime: completionData.completiontime || "00:00:00",
        };
        dispatch({ type: "ADD_COMPLETED_ADVENTURE", data: mockCompletion });
        return mockCompletion;
      }
    },
    [apiCall]
  );

  // Helper functions for common queries
  const getAdventuresByRegion = useCallback(
    (regionid: number): Adventure[] => {
      return state.adventures.filter(
        (adventure) => adventure.regionid === regionid
      );
    },
    [state.adventures]
  );

  const getTokensByAdventure = useCallback(
    (adventureid: number): Token[] => {
      return state.tokens.filter((token) => token.adventureid === adventureid);
    },
    [state.tokens]
  );

  const getCompletedAdventuresByUser = useCallback(
    (adventurerid: number): CompletedAdventure[] => {
      return state.completedAdventures.filter(
        (completed) => completed.adventurerid === adventurerid
      );
    },
    [state.completedAdventures]
  );

  const getLandmarksByRegion = useCallback(
    (regionid: number): Landmark[] => {
      return state.landmarks.filter(
        (landmark) => landmark.regionid === regionid
      );
    },
    [state.landmarks]
  );

  // Clear errors
  const clearError = useCallback((entity: EntityType): void => {
    dispatch({ type: "CLEAR_ERROR", entity });
  }, []);

  // Test connectivity function
  const testConnectivity = useCallback(async (): Promise<void> => {
    if (__DEV__) {
      console.log("Testing API connectivity...");
      try {
        // Test with a simple endpoint first
        const testResponse = await fetch(API_BASE_URL);
        console.log(
          "Base URL test response:",
          testResponse.status,
          testResponse.statusText
        );

        // Try the adventures endpoint that we know works
        const adventuresResponse = await fetch(`${API_BASE_URL}/adventures`);
        console.log(
          "Adventures endpoint test:",
          adventuresResponse.status,
          adventuresResponse.statusText
        );
      } catch (error) {
        console.log("Connectivity test failed:", error);
      }
    }
  }, [API_BASE_URL]);

  // Initialize data on mount
  useEffect(() => {
    if (__DEV__) {
      console.log("DatabaseProvider initializing...");
      console.log("API Base URL:", API_BASE_URL);
    }

    // Initialize data with error handling to prevent server crashes
    const initializeData = async (): Promise<void> => {
      // Test connectivity first
      if (__DEV__) {
        await testConnectivity();
      }

      try {
        await fetchAdventurers();
      } catch (error) {
        console.error("Failed to initialize adventurers:", error);
      }

      try {
        await fetchRegions();
      } catch (error) {
        console.error("Failed to initialize regions:", error);
      }

      try {
        await fetchAdventures();
      } catch (error) {
        console.error("Failed to initialize adventures:", error);
      }
    };

    initializeData();
  }, [fetchAdventurers, fetchRegions, fetchAdventures, testConnectivity]);

  // Context value
  const contextValue: DatabaseContextValue = {
    // State
    ...state,

    // Fetch functions
    fetchAdventurers,
    fetchRegions,
    fetchLandmarks,
    fetchAdventures,
    fetchCompletedAdventures,

    // Create/Update functions
    createAdventurer,
    updateAdventurer,
    createRegion,
    createLandmark,
    createAdventure,
    createToken,
    completeAdventure,

    // Helper functions
    getAdventuresByRegion,
    getTokensByAdventure,
    getCompletedAdventuresByUser,
    getLandmarksByRegion,

    // Utility functions
    clearError,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook to use the database context
export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}

export type {
  DatabaseAction,
  DatabaseContextValue, DatabaseState, EntityType
};

