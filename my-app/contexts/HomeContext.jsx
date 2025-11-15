import {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
} from "react";
import { MOCK_ADVENTURES } from "../components/home/MockData";

const HomeContext = createContext();

const initialState = {
  data: [],
  isAuthenticated: false,
};

function reducer(state, action) {
  console.log(action.payload);
  switch (action.type) {
    case "set/data":
      return {
        ...state,
        data: action.payload,
      };
    case "logout":
      return {
        ...state,
        user: null,
        email: null,
        password: null,
        isAuthenticated: false,
      };
    default:
      throw Error("Unkown Action.");
  }
}

function HomeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, email, isAuthenticated } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch adventures (can be called externally by consumers)
  const fetchAdventures = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        "https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net/adventures",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to match the app's Adventure shape
      const transformed = data.map((item) => ({
        id: item.id?.toString(),
        title: item.name,
        summary: item.name,
        description: item.name,
        image_url: null,
        region: {
          id: item.regionid?.toString() || "1",
          name: `Region ${item.regionid}`,
          center: {
            lat: item.location?.x || 42.9301,
            lng: item.location?.y || -85.5883,
          },
        },
        tokenCount: item.numtokens || 0,
        difficulty: "Medium",
        estimatedTime: "30 min",
        status: "published",
      }));

      dispatch({ type: "set/data", payload: transformed });
    } catch (err) {
      console.error("Error fetching adventures:", err);
      setError(err.message || "Failed to fetch adventures");
      // Fallback to mock data in development
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("API failed, falling back to mock data...");
        dispatch({ type: "set/data", payload: MOCK_ADVENTURES });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load adventures on component mount
  useEffect(() => {
    fetchAdventures();
  }, []);

  return (
    <HomeContext.Provider
      value={{
        user,
        email,
        isAuthenticated,
        isLoading,
        error,
        adventures: state.data,
        fetchAdventures,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

function useHome() {
  const context = useContext(HomeContext);

  if (context === undefined)
    throw new Error("Context was used outside the AuthProvider");
  return context;
}

export { HomeProvider, useHome };
