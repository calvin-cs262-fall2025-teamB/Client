import { hybridDataService } from "@/data/hybridDataService";
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
  fetchTokens: (adventureid?: number | null) => Promise<Token[] | undefined>;
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
  
  // Sync and status functions
  syncWithRemote: () => Promise<{ success: boolean; error?: string }>;
  getDataSourceStatus: () => Promise<{
    azure: boolean;
    sqlite: boolean;
    mock: boolean;
  }>;
  getLastSyncTime: () => Date | null;
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
      const result = await hybridDataService.fetchAdventurers();
      const adventurersArray = Array.isArray(result.data) ? result.data : [];
      dispatch({ type: "SET_ADVENTURERS", data: adventurersArray });
      
      if (__DEV__) {
        console.log(`✅ Adventurers loaded from: ${result.source}`);
      }
      
      return result.data;
    } catch (error) {
      if (__DEV__) {
        console.error("All data sources failed for adventurers:", error);
      }
      dispatch({
        type: "SET_ERROR",
        entity: "adventurers",
        error: error instanceof Error ? error.message : "Failed to load adventurers"
      });
      return undefined;
    }
  }, []);

  const fetchRegions = useCallback(async (): Promise<Region[] | undefined> => {
    dispatch({
      type: "SET_LOADING",
      entity: "regions",
      isLoading: true,
    });
    try {
      const result = await hybridDataService.fetchRegions();
      dispatch({ type: "SET_REGIONS", data: result.data });
      
      if (__DEV__) {
        console.log(`✅ Regions loaded from: ${result.source}`);
      }
      
      return result.data;
    } catch (error) {
      if (__DEV__) {
        console.error("All data sources failed for regions:", error);
      }
      dispatch({
        type: "SET_ERROR",
        entity: "regions",
        error: error instanceof Error ? error.message : "Failed to load regions"
      });
      return undefined;
    }
  }, []);

  const fetchLandmarks = useCallback(
    async (regionid: number | null = null): Promise<Landmark[] | undefined> => {
      dispatch({
        type: "SET_LOADING",
        entity: "landmarks",
        isLoading: true,
      });
      try {
        const result = await hybridDataService.fetchLandmarks(regionid);
        dispatch({ type: "SET_LANDMARKS", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Landmarks loaded from: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("All data sources failed for landmarks:", error);
        }
        dispatch({
          type: "SET_ERROR",
          entity: "landmarks",
          error: error instanceof Error ? error.message : "Failed to load landmarks"
        });
        return undefined;
      }
    },
    []
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
        const result = await hybridDataService.fetchAdventures(regionid, adventurerid);
        dispatch({ type: "SET_ADVENTURES", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Adventures loaded from: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("All data sources failed for adventures:", error);
        }
        dispatch({
          type: "SET_ERROR",
          entity: "adventures",
          error: error instanceof Error ? error.message : "Failed to load adventures"
        });
        return undefined;
      }
    },
    []
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

        const result = await hybridDataService.fetchCompletedAdventures(adventurerid);
        
        if (__DEV__) {
          console.log("Completed adventures response:", result.data);
          // console.log(
          //   "Completed adventures type:",
          //   typeof result.data,
          //   Array.isArray(result.data)
          // );
          if (result.data && result.data.length > 0) {
            // console.log("Sample completed adventure:", result.data[0]);
            // console.log("Available fields:", Object.keys(result.data[0]));
          } else {
            console.log(
              "No completed adventures found for user:",
              adventurerid
            );
          }
          console.log(`✅ Completed adventures loaded from: ${result.source}`);
        }

        // Ensure data is an array
        const completedArray = Array.isArray(result.data) ? result.data : [];
        dispatch({
          type: "SET_COMPLETED_ADVENTURES",
          data: completedArray,
        });
        return completedArray;
      } catch (error) {
        if (__DEV__) {
          console.error("All data sources failed for completed adventures:", error);
        }
        dispatch({
          type: "SET_ERROR",
          entity: "completedAdventures",
          error: error instanceof Error ? error.message : "Failed to load completed adventures"
        });
        return undefined;
      }
    },
    []
  );
  

  const fetchTokens = useCallback(
    async (adventureid: number | null = null): Promise<Token[] | undefined> => {
      dispatch({
        type: "SET_LOADING",
        entity: "tokens",
        isLoading: true,
      });
      try {
        const result = await hybridDataService.fetchTokens(adventureid);
        dispatch({ type: "SET_TOKENS", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Tokens loaded from: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("All data sources failed for tokens:", error);
        }
        dispatch({
          type: "SET_ERROR",
          entity: "tokens",
          error: error instanceof Error ? error.message : "Failed to load tokens"
        });
        return undefined;
      }
    },
    []
  );
  

  // Create/Update functions
  const createAdventurer = useCallback(
    async (adventurerData: CreateAdventurer): Promise<Adventurer> => {
      try {
        const result = await hybridDataService.createAdventurer(adventurerData);
        dispatch({ type: "ADD_ADVENTURER", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Adventurer created using: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("Failed to create adventurer:", error);
        }
        throw error;
      }
    },
    []
  );

  const updateAdventurer = useCallback(
    async (
      id: number,
      adventurerData: Omit<UpdateAdventurer, 'id'>
    ): Promise<Adventurer> => {
      try {
        const result = await hybridDataService.updateAdventurer(id, adventurerData);
        dispatch({ type: "UPDATE_ADVENTURER", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Adventurer updated using: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        console.error("Error updating adventurer:", error);
        throw error;
      }
    },
    []
  );

  const createRegion = useCallback(
    async (regionData: CreateRegion): Promise<Region> => {
      try {
        const result = await hybridDataService.createRegion(regionData);
        dispatch({ type: "ADD_REGION", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Region created using: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("Failed to create region:", error);
        }
        throw error;
      }
    },
    []
  );

  const createLandmark = useCallback(
    async (landmarkData: CreateLandmark): Promise<Landmark> => {
      try {
        const result = await hybridDataService.createLandmark(landmarkData);
        dispatch({ type: "ADD_LANDMARK", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Landmark created using: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("Failed to create landmark:", error);
        }
        throw error;
      }
    },
    []
  );

  const createAdventure = useCallback(
    async (adventureData: CreateAdventure): Promise<Adventure> => {
      try {
        const result = await hybridDataService.createAdventure(adventureData);
        dispatch({ type: "ADD_ADVENTURE", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Adventure created using: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("Failed to create adventure:", error);
        }
        throw error;
      }
    },
    []
  );

  const createToken = useCallback(
    async (tokenData: CreateToken): Promise<Token> => {
      try {
        const result = await hybridDataService.createToken(tokenData);
        dispatch({ type: "ADD_TOKEN", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Token created using: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("Failed to create token:", error);
        }
        throw error;
      }
    },
    []
  );

  const completeAdventure = useCallback(
    async (
      completionData: CreateCompletedAdventure
    ): Promise<CompletedAdventure> => {
      try {
        const result = await hybridDataService.createCompletedAdventure(completionData);
        dispatch({ type: "ADD_COMPLETED_ADVENTURE", data: result.data });
        
        if (__DEV__) {
          console.log(`✅ Adventure completion recorded using: ${result.source}`);
        }
        
        return result.data;
      } catch (error) {
        if (__DEV__) {
          console.error("Failed to complete adventure:", error);
        }
        throw error;
      }
    },
    []
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

  // Sync and status functions
  const syncWithRemote = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await hybridDataService.fullSync();
      if (result.success) {
        // Refresh all data after successful sync
        await Promise.all([
          fetchAdventurers(),
          fetchRegions(),
          fetchLandmarks(),
          fetchAdventures(),
          fetchTokens()
        ]);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      };
    }
  }, [fetchAdventurers, fetchRegions, fetchLandmarks, fetchAdventures, fetchTokens]);

  const getDataSourceStatus = useCallback(async () => {
    return await hybridDataService.getDataSourceStatus();
  }, []);

  const getLastSyncTime = useCallback(() => {
    return hybridDataService.getLastSyncTime();
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
    fetchTokens,
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
    
    // Sync and status functions
    syncWithRemote,
    getDataSourceStatus,
    getLastSyncTime,
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

