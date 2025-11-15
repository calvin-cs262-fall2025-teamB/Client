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
  adventures: null,
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

  // Load adventures on component mount
  useEffect(() => {
    // Fetch adventures from Azure API
    const fetchAdventures = async () => {
      try {
        setIsLoading(true);
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
        dispatch({ type: "set/data", payload: data });
      } catch (err) {
        console.error("Error fetching adventures:", err);
        // Fallback to mock data in development
        if (__DEV__) {
          console.log("API failed, falling back to mock data...");
          dispatch({ type: "set/data", payload: MOCK_ADVENTURES });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdventures();
  }, []);

  return (
    <HomeContext.Provider
      value={{
        user,
        email,
        isAuthenticated,
        isLoading,
        setIsLoading,
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
