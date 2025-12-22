"use client";
import { Adventurer, CreateAdventurer, UpdateAdventurer } from "@/types/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useReducer,
  useState,
} from "react";
import { Alert } from "react-native";
import { useDatabase } from "./DatabaseContext";

// State interface
interface AuthState {
  user: Adventurer | null;
  username: string | null;
  email: string | null;
  profilePicture: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Action types
type AuthAction =
  | { type: "set_loading"; payload: boolean }
  | { type: "set_user_data"; payload: { user: Adventurer | null } }
  | { type: "edit/username"; payload: string }
  | {
      type: "signup";
      payload: { username: string; user: Adventurer };
    }
  | {
      type: "login";
      payload: { user: Adventurer; username: string };
    }
  | { type: "logout" };

// Context value interface
interface AuthContextValue {
  // User data
  user: Adventurer | null;
  username: string | null;
  email: string | null;
  profilepicture: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Authentication functions
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<Adventurer>;
  logout: () => Promise<void>;

  // Profile management functions
  editUsername: (newUsername: string) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  username: null,
  email: null,
  profilePicture: null,
  isAuthenticated: false,
  isLoading: false,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "set_loading":
      return { ...state, isLoading: action.payload };

    case "set_user_data":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.user?.username || null,
        profilePicture: action.payload.user?.profilepicture || null,
      };

    case "edit/username":
      return { ...state, username: action.payload };

    case "signup":
      return {
        ...state,
        username: action.payload.username,
        user: action.payload.user,
        email: null, // Email no longer used
        profilePicture: action.payload.user?.profilepicture || null,
        isAuthenticated: true,
        isLoading: false,
      };

    case "login":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.username,
        email: null,
        profilePicture: action.payload.user?.profilepicture || null,
        isAuthenticated: true,
        isLoading: false,
      };

    case "logout":
      return {
        ...state,
        user: null,
        username: null,
        email: null,
        profilePicture: null,
        isAuthenticated: false,
        isLoading: false,
      };

    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { user, email, username, isAuthenticated, profilePicture } = state;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  // Get database context functions
  const { fetchAdventurers, createAdventurer, updateAdventurer } =
    useDatabase();

  async function signup(
    username: string,
    password: string
  ): Promise<Adventurer> {
    setIsLoading(true);

    try {
      const adventurerData: CreateAdventurer = {
        username,
        password,
        profilepicture: null,
      };

      const user = await createAdventurer(adventurerData);

      // User is now created (either from backend or as mock user)
      dispatch({
        type: "signup",
        payload: { username, user },
      });

      return user;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    setIsLoading(true);

    try {
      const res = await fetchAdventurers();
      const user = res?.find((el) => el.username === username);

      if (user) {
        if (user.password === password) {
          dispatch({
            type: "login",
            payload: { user, username: user.username },
          });
          return true;
        } else {
          Alert.alert("Validation", "Invalid Password.");
          return false;
        }
      } else {
        Alert.alert(
          "Validation",
          "Account not found, sign up with the link below."
        );
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Error", "Login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function editUsername(newUsername: string): Promise<void> {
    if (!user) {
      throw new Error("No user is currently logged in");
    }

    try {
      const updatedAdventurer: UpdateAdventurer = {
        id: user.id,
        username: user.username,
        password: user.password,
        profilepicture: user.profilepicture
      }
      await updateAdventurer(user.id, updatedAdventurer);
      dispatch({ type: "edit/username", payload: newUsername });
    } catch (error) {
      console.error("Failed to update username:", error);
      Alert.alert("Error", "Failed to update username. Please try again.");
      throw error;
    }
  }

  async function logout(): Promise<void> {
    try {
      // remove any stored auth tokens if present
      await SecureStore.deleteItemAsync("authToken");
    } catch (_e) {
      // ignore
    }
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (_e) {
      // ignore
    }

    dispatch({ type: "logout" });

    // navigate to login/sign-in route
    try {
      router.replace("/login");
    } catch (_e) {
      // ignore navigation errors
    }
  }

  return (
    <AuthContext.Provider
      value={{
        // User data
        user,
        username,
        email,
        profilepicture: profilePicture,
        isAuthenticated,
        isLoading,
        setIsLoading,

        // Authentication functions
        login,
        signup,
        logout,

        // Profile management functions
        editUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("useAuth was used outside the AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
export type { AuthAction, AuthContextValue, AuthState };

