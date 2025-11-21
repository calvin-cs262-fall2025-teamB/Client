import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

// Type definitions based on your PostgreSQL schema
const DatabaseContext = createContext();

// Initial state structure
const initialState = {
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
  }
};

// Action types
const ActionTypes = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  
  // Data fetch success actions
  SET_ADVENTURERS: 'SET_ADVENTURERS',
  SET_REGIONS: 'SET_REGIONS',
  SET_LANDMARKS: 'SET_LANDMARKS',
  SET_ADVENTURES: 'SET_ADVENTURES',
  SET_TOKENS: 'SET_TOKENS',
  SET_COMPLETED_ADVENTURES: 'SET_COMPLETED_ADVENTURES',
  
  // Individual entity actions
  ADD_ADVENTURER: 'ADD_ADVENTURER',
  UPDATE_ADVENTURER: 'UPDATE_ADVENTURER',
  ADD_REGION: 'ADD_REGION',
  UPDATE_REGION: 'UPDATE_REGION',
  ADD_ADVENTURE: 'ADD_ADVENTURE',
  UPDATE_ADVENTURE: 'UPDATE_ADVENTURE',
  ADD_TOKEN: 'ADD_TOKEN',
  ADD_COMPLETED_ADVENTURE: 'ADD_COMPLETED_ADVENTURE',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
function databaseReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: action.isLoading,
        },
      };

    case ActionTypes.SET_ADVENTURERS:
      return {
        ...state,
        adventurers: action.data,
        loading: { ...state.loading, adventurers: false },
        errors: { ...state.errors, adventurers: null },
        lastUpdated: { ...state.lastUpdated, adventurers: new Date().toISOString() },
      };

    case ActionTypes.SET_REGIONS:
      return {
        ...state,
        regions: action.data,
        loading: { ...state.loading, regions: false },
        errors: { ...state.errors, regions: null },
        lastUpdated: { ...state.lastUpdated, regions: new Date().toISOString() },
      };

    case ActionTypes.SET_LANDMARKS:
      return {
        ...state,
        landmarks: action.data,
        loading: { ...state.loading, landmarks: false },
        errors: { ...state.errors, landmarks: null },
        lastUpdated: { ...state.lastUpdated, landmarks: new Date().toISOString() },
      };

    case ActionTypes.SET_ADVENTURES:
      return {
        ...state,
        adventures: action.data,
        loading: { ...state.loading, adventures: false },
        errors: { ...state.errors, adventures: null },
        lastUpdated: { ...state.lastUpdated, adventures: new Date().toISOString() },
      };

    case ActionTypes.SET_TOKENS:
      return {
        ...state,
        tokens: action.data,
        loading: { ...state.loading, tokens: false },
        errors: { ...state.errors, tokens: null },
        lastUpdated: { ...state.lastUpdated, tokens: new Date().toISOString() },
      };

    case ActionTypes.SET_COMPLETED_ADVENTURES:
      return {
        ...state,
        completedAdventures: action.data,
        loading: { ...state.loading, completedAdventures: false },
        errors: { ...state.errors, completedAdventures: null },
        lastUpdated: { ...state.lastUpdated, completedAdventures: new Date().toISOString() },
      };

    case ActionTypes.ADD_ADVENTURER:
      return {
        ...state,
        adventurers: [...state.adventurers, action.data],
      };

    case ActionTypes.UPDATE_ADVENTURER:
      return {
        ...state,
        adventurers: state.adventurers.map(adventurer =>
          adventurer.id === action.data.id ? { ...adventurer, ...action.data } : adventurer
        ),
      };

    case ActionTypes.ADD_REGION:
      return {
        ...state,
        regions: [...state.regions, action.data],
      };

    case ActionTypes.ADD_ADVENTURE:
      return {
        ...state,
        adventures: [...state.adventures, action.data],
      };

    case ActionTypes.ADD_TOKEN:
      return {
        ...state,
        tokens: [...state.tokens, action.data],
      };

    case ActionTypes.ADD_COMPLETED_ADVENTURE:
      return {
        ...state,
        completedAdventures: [...state.completedAdventures, action.data],
      };

    case ActionTypes.SET_ERROR:
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

    case ActionTypes.CLEAR_ERROR:
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

// DatabaseProvider component
export function DatabaseProvider({ children }) {
  const [state, dispatch] = useReducer(databaseReducer, initialState);

  // Helper function to format location objects as PostgreSQL points
  const formatLocationForPostgreSQL = (location) => {
    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
      return null;
    }
    return `(${location.x},${location.y})`;
  };

  // Base API URL - using your working Azure service
  const API_BASE_URL = 'https://beautifulguys-bsayggeve3c6esba.canadacentral-01.azurewebsites.net';

  // Generic API call function with React Native network handling
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add headers that help with React Native networking
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers,
      },
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    // if (__DEV__) {
    //   console.log(`Making ${defaultOptions.method} request to:`, fullUrl);
    //   console.log('Request headers:', defaultOptions.headers);
    // }

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

      // if (__DEV__) {
      //   console.log(`Response status: ${response.status} ${response.statusText}`);
      //   console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      //   console.log('Response URL:', response.url);
      // }

      if (!response.ok) {
        let errorText = 'No error details available';
        try {
          errorText = await response.text();
        } catch (e) {
          console.log('Could not read error response body');
        }
        
        if (__DEV__) {
          console.log('Error response body:', errorText);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        const text = await response.text();
        if (__DEV__) {
          console.log('Non-JSON response received:', text);
        }
        // Try to parse as JSON anyway
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('Response is not valid JSON');
        }
      }
    } catch (fetchError) {
      if (__DEV__) {
        console.log('Fetch error type:', fetchError.name);
        console.log('Fetch error message:', fetchError.message);
        console.log('Full fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          console.log('Request timed out after 10 seconds');
        } else if (fetchError.message.includes('Network request failed')) {
          console.log('Network connectivity issue - check if you can access the URL in a browser');
        }
      }
      throw fetchError;
    }
  }, [API_BASE_URL]);

  /* Data fetching functions */

  const fetchAdventurers = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, entity: 'adventurers', isLoading: true });
    try {
      const fullUrl = `${API_BASE_URL}/adventurers`;
      // if (__DEV__) {
      //   console.log('Fetching adventurers from:', fullUrl);
      // }
      
      const data = await apiCall('/adventurers');
      
      // if (__DEV__) {
      //   console.log('Adventurers response received:', typeof data, Array.isArray(data));
      //   console.log('Adventurers fetched successfully:', data?.length || 0);
      //   if (data && data.length > 0) {
      //     console.log('Sample adventurer data:', data[0]);
      //   } else {
      //     console.log('No adventurers returned or empty array');
      //   }
      // }
      
      // Ensure data is an array
      const adventurersArray = Array.isArray(data) ? data : [];
      dispatch({ type: ActionTypes.SET_ADVENTURERS, data: adventurersArray });
    } catch (error) {
      console.error('Error fetching adventurers:', error);
      if (__DEV__) {
        console.log('Error type:', typeof error);
        console.log('Error message:', error.message);
        console.log('Error status:', error.status);
        console.log('Full error object:', JSON.stringify(error, null, 2));
        
        // Try to check if it's a network issue
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          console.log('This appears to be a network connectivity issue');
        } else if (error.message.includes('HTTP error')) {
          console.log('This appears to be an HTTP status error (404, 500, etc.)');
        }
      }
      
      // Fallback to empty array if fetch fails
      dispatch({ type: ActionTypes.SET_ADVENTURERS, data: [] });
      dispatch({ type: ActionTypes.SET_ERROR, entity: 'adventurers', error: error.message });
    }
  }, [apiCall, API_BASE_URL]);

  const fetchRegions = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, entity: 'regions', isLoading: true });
    try {
      const data = await apiCall('/regions');
      dispatch({ type: ActionTypes.SET_REGIONS, data });
    } catch (error) {
      console.error('Error fetching regions:', error);
      dispatch({ type: ActionTypes.SET_ERROR, entity: 'regions', error: error.message });
    }
  }, [apiCall]);

  const fetchLandmarks = useCallback(async (regionId = null) => {
    dispatch({ type: ActionTypes.SET_LOADING, entity: 'landmarks', isLoading: true });
    try {
      const endpoint = regionId ? `/landmarks?regionId=${regionId}` : '/landmarks';
      const data = await apiCall(endpoint);
      dispatch({ type: ActionTypes.SET_LANDMARKS, data });
    } catch (error) {
      console.error('Error fetching landmarks:', error);
      dispatch({ type: ActionTypes.SET_ERROR, entity: 'landmarks', error: error.message });
    }
  }, [apiCall]);

  const fetchAdventures = useCallback(async (regionId = null, adventurerId = null) => {
    dispatch({ type: ActionTypes.SET_LOADING, entity: 'adventures', isLoading: true });
    try {
      let endpoint = '/adventures';
      const params = new URLSearchParams();
      if (regionId) params.append('regionId', regionId);
      if (adventurerId) params.append('adventurerId', adventurerId);
      if (params.toString()) endpoint += `?${params.toString()}`;
      
      const data = await apiCall(endpoint);
      dispatch({ type: ActionTypes.SET_ADVENTURES, data });
    } catch (error) {
      console.error('Error fetching adventures:', error);
      dispatch({ type: ActionTypes.SET_ERROR, entity: 'adventures', error: error.message });
    }
  }, [apiCall]);

  const fetchTokens = useCallback(async (adventureId = null) => {
    dispatch({ type: ActionTypes.SET_LOADING, entity: 'tokens', isLoading: true });
    try {
      const endpoint = adventureId ? `/tokens/adventure/${adventureId}` : '/tokens';
      const data = await apiCall(endpoint);
      dispatch({ type: ActionTypes.SET_TOKENS, data });
    } catch (error) {
      console.error('Error fetching tokens:', error);
      dispatch({ type: ActionTypes.SET_ERROR, entity: 'tokens', error: error.message });
    }
  }, [apiCall]);

  const fetchCompletedAdventures = useCallback(async (adventurerId) => {
    dispatch({ type: ActionTypes.SET_LOADING, entity: 'completedAdventures', isLoading: true });
    try {
      if (__DEV__) {
        console.log('Fetching completed adventures for adventurer:', adventurerId);
      }
      
      const data = await apiCall(`/completedAdventures/adventurer/${adventurerId}`);
      
      if (__DEV__) {
        console.log('Completed adventures response:', data);
        console.log('Completed adventures type:', typeof data, Array.isArray(data));
        if (data && data.length > 0) {
          console.log('Sample completed adventure:', data[0]);
          console.log('Available fields:', Object.keys(data[0]));
        } else {
          console.log('No completed adventures found for user:', adventurerId);
        }
      }
      
      // Ensure data is an array
      const completedArray = Array.isArray(data) ? data : [];
      dispatch({ type: ActionTypes.SET_COMPLETED_ADVENTURES, data: completedArray });
    } catch (error) {
      console.error('Error fetching completed adventures:', error);
      if (__DEV__) {
        console.log('Completed adventures fetch failed, using empty array');
        
        // For development, provide mock data if the endpoint fails
        const mockCompletedAdventures = [
          {
            adventureId: 1,
            completionDate: new Date().toISOString(),
            tokens: 25
          },
          {
            adventureId: 2, 
            completionDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            tokens: 30
          }
        ];
        
        console.log('Using mock completed adventures for development:', mockCompletedAdventures);
        dispatch({ type: ActionTypes.SET_COMPLETED_ADVENTURES, data: mockCompletedAdventures });
      } else {
        dispatch({ type: ActionTypes.SET_COMPLETED_ADVENTURES, data: [] });
      }
      
      dispatch({ type: ActionTypes.SET_ERROR, entity: 'completedAdventures', error: error.message });
    }
  }, [apiCall]);

  // Create/Update functions
  const createAdventurer = useCallback(async (adventurerData) => {
    try {
      // Validate ID range to prevent PostgreSQL integer overflow
      if (adventurerData.id && adventurerData.id > 2147483647) {
        if (__DEV__) {
          console.warn('Adventurer ID too large for PostgreSQL integer, removing ID to let DB generate it');
        }
        const { id, ...dataWithoutId } = adventurerData;
        adventurerData = dataWithoutId;
      }
      
      const data = await apiCall('/adventurers', {
        method: 'POST',
        body: JSON.stringify(adventurerData),
      });
      dispatch({ type: ActionTypes.ADD_ADVENTURER, data });
      return data;
    } catch (error) {
      console.error('Error creating adventurer:', error);
      if (__DEV__) {
        console.log('Adventurer data that failed:', adventurerData);
      }
      throw error;
    }
  }, [apiCall]);

  const updateAdventurer = useCallback(async (id, adventurerData) => {
    try {
      const data = await apiCall(`/adventurer/${id}`, {
        method: 'PUT',
        body: JSON.stringify(adventurerData),
      });
      dispatch({ type: ActionTypes.UPDATE_ADVENTURER, data });
      return data;
    } catch (error) {
      console.error('Error updating adventurer:', error);
      throw error;
    }
  }, [apiCall]);

  const createRegion = useCallback(async (regionData) => {
    try {
      // Format location for PostgreSQL point type
      const formattedData = {
        ...regionData,
        location: formatLocationForPostgreSQL(regionData.location)
      };
      
      const data = await apiCall('/regions', {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
      dispatch({ type: ActionTypes.ADD_REGION, data });
      return data;
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  }, [apiCall]);

  const createAdventure = useCallback(async (adventureData) => {
    try {
      // Format location for PostgreSQL point type
      const formattedData = {
        ...adventureData,
        location: formatLocationForPostgreSQL(adventureData.location)
      };
      
      const data = await apiCall('/adventures', {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
      dispatch({ type: ActionTypes.ADD_ADVENTURE, data });
      return data;
    } catch (error) {
      console.error('Error creating adventure:', error);
      throw error;
    }
  }, [apiCall]);

  const createToken = useCallback(async (tokenData) => {
    try {
      // Format location for PostgreSQL point type
      const formattedData = {
        ...tokenData,
        location: formatLocationForPostgreSQL(tokenData.location)
      };
      
      const data = await apiCall('/tokens', {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
      dispatch({ type: ActionTypes.ADD_TOKEN, data });
      return data;
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }, [apiCall]);

  const completeAdventure = useCallback(async (completionData) => {
    try {
      const data = await apiCall('/completed-adventures', {
        method: 'POST',
        body: JSON.stringify(completionData),
      });
      dispatch({ type: ActionTypes.ADD_COMPLETED_ADVENTURE, data });
      return data;
    } catch (error) {
      console.error('Error completing adventure:', error);
      throw error;
    }
  }, [apiCall]);

  // Helper functions for common queries
  const getAdventuresByRegion = useCallback((regionId) => {
    return state.adventures.filter(adventure => adventure.regionid === regionId);
  }, [state.adventures]);

  const getTokensByAdventure = useCallback((adventureId) => {
    return state.tokens.filter(token => token.adventureid === adventureId);
  }, [state.tokens]);

  const getCompletedAdventuresByUser = useCallback((adventurerId) => {
    return state.completedAdventures.filter(completed => completed.adventurerid === adventurerId);
  }, [state.completedAdventures]);

  const getLandmarksByRegion = useCallback((regionId) => {
    return state.landmarks.filter(landmark => landmark.regionid === regionId);
  }, [state.landmarks]);

  // Clear errors
  const clearError = useCallback((entity) => {
    dispatch({ type: ActionTypes.CLEAR_ERROR, entity });
  }, []);

  // Test connectivity function
  const testConnectivity = useCallback(async () => {
    if (__DEV__) {
      console.log('Testing API connectivity...');
      try {
        // Test with a simple endpoint first
        const testResponse = await fetch(API_BASE_URL);
        console.log('Base URL test response:', testResponse.status, testResponse.statusText);
        
        // Try the adventures endpoint that we know works
        const adventuresResponse = await fetch(`${API_BASE_URL}/adventures`);
        console.log('Adventures endpoint test:', adventuresResponse.status, adventuresResponse.statusText);
        
      } catch (error) {
        console.log('Connectivity test failed:', error);
      }
    }
  }, [API_BASE_URL]);

  // Initialize data on mount
  useEffect(() => {
    if (__DEV__) {
      console.log('DatabaseProvider initializing...');
      console.log('API Base URL:', API_BASE_URL);
    }
    
    // Initialize data with error handling to prevent server crashes
    const initializeData = async () => {
      // Test connectivity first
      if (__DEV__) {
        await testConnectivity();
      }
      
      try {
        await fetchAdventurers();
      } catch (error) {
        console.error('Failed to initialize adventurers:', error);
      }
      
      try {
        await fetchRegions();
      } catch (error) {
        console.error('Failed to initialize regions:', error); 
      }
      
      try {
        await fetchAdventures();
      } catch (error) {
        console.error('Failed to initialize adventures:', error);
      }
    };
    
    initializeData();
  }, [fetchAdventurers, fetchRegions, fetchAdventures, testConnectivity]);

  // Context value
  const contextValue = {
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
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
