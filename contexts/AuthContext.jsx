"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { createContext, useContext, useReducer, useState } from "react";
import { Alert } from "react-native";

//Encryption Resource
// Use bcryptjs (pure JS) in the React Native/Expo runtime instead of native `bcrypt`.
// Note: password hashing should ideally be performed on the server-side; this is
// a temporary client-side approach for development/demo only.
// import * as Random from "expo-random";

// Tell bcryptjs how to get random bytes in React Native/Expo
// bcrypt.setRandomFallback((len) => {
//   const bytes = Random.getRandomBytes(len);
//   // bcryptjs expects a string of random bytes
//   return Array.from(bytes)
//     .map((b) => String.fromCharCode(b))
//     .join("");
// });

//API Functions

import { useDatabase } from "./DatabaseContext";

const AuthContext = createContext();

const initialState = {
  user: null,
  username: null,
  email: null,
  // TODO: figure out how to store image urls
  profilePicture: null,

  isAuthenticated: false,
  isLoading: false,
};

function reducer(state, action) {
  // if (__DEV__) {
  //   console.log('AuthContext action:', action.type, action.payload);
  // }
  
  switch (action.type) {
    case "set_loading":
      return { ...state, isLoading: action.payload };

    case "set_user_data":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.user?.username || null,
        profilePicture: action.payload.user?.profilepicture || null, // Use lowercase field name
      };

    case "edit/username":
      return { ...state, username: action.payload };

    case "signup":
      return {
        ...state,
        username: action.payload.username,
        user: action.payload.user,
        email: null, // Email no longer used
        isAuthenticated: true,
        isLoading: false,
      };

    case "login":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.username,
        email: null, // Email no longer used
        profilepicture: action.payload.user?.profilepicture || null, // Use lowercase field name
        isAuthenticated: true,
        isLoading: false,
      };

    case "logout":
      return {
        ...state,
        user: null,
        username: null,
        email: null,
        password: null,
        profilePicture: null,
        isAuthenticated: false,
        isLoading: false,
      };

    default:
      throw Error("Unknown Action: " + action.type);
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { user, email, username, isAuthenticated, profilePicture } = state;
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Get database context functions
  const { fetchAdventurers, createAdventurer, updateAdventurer } =
    useDatabase();

  async function signup(username, password) {
    setIsLoading(true);
    
    try {
      const res = await createAdventurer({
        username,
        password,
        profilepicture: null, // Use lowercase to match database schema
      });

      const data = await fetchAdventurers();
      const user = data.find((el) => el.id === res.id);

      dispatch({
        type: "signup",
        payload: { username, email: null, user },
      });
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username, password) {
    setIsLoading(true);
    
    try {
      const res = await fetchAdventurers();
      const user = res.find((el) => el.username === username);

      if (user) {
        if (user.password === password) {
          dispatch({
            type: "login",
            payload: { user, username: user.username, email: null },
          });
        } else {
          Alert.alert("Validation", "Invalid Password.");
        }
      } else {
        Alert.alert(
          "Validation",
          "Account not found, sign up with the link below."
        );
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function editUsername(newUsername) {
    try {
      const res = await updateAdventurer(user.id, { username: newUsername });
      dispatch({ type: "edit/username", payload: newUsername });
    } catch (error) {
      console.error("Failed to update username:", error);
      Alert.alert("Error", "Failed to update username. Please try again.");
    }
  }
  // Email functionality removed - app now uses username-only authentication

  async function logout() {
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
        profilePicture,
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

function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("Context was used outside the AuthProvider");
  return context;
}

export { AuthProvider, useAuth };

