"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useReducer } from "react";
import { useDatabase } from "./DatabaseContext";

const AuthContext = createContext();

const initialState = {
  user: null, // Will contain full Adventurer object from database
  username: null,
  email: null,
  password: null,
  profilePicture: null,
  isAuthenticated: false,
  isLoading: false,
};

function reducer(state, action) {
  if (__DEV__) {
    console.log('AuthContext action:', action.type, action.payload);
  }
  
  switch (action.type) {
    case "set_loading":
      return { ...state, isLoading: action.payload };
    
    case "set_user_data":
      return { 
        ...state, 
        user: action.payload.user,
        username: action.payload.user?.username || null,
        profilePicture: action.payload.user?.profilePicture || null,
      };
    
    case "edit/username":
      return { 
        ...state, 
        user: state.user ? { ...state.user, username: action.payload } : null,
        username: action.payload
      };
    
    case "edit/email":
      return { ...state, email: action.payload };
    
    case "signup":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.user?.username || null,
        email: action.payload.email,
        password: action.payload.password,
        profilePicture: action.payload.user?.profilePicture || null,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case "login":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.user?.username || null,
        email: action.payload.email,
        profilePicture: action.payload.user?.profilePicture || null,
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
  const { user, username, email, isAuthenticated, isLoading, profilePicture } = state;
  const router = useRouter();
  
  // Get database context functions
  const { adventurers, fetchAdventurers, createAdventurer, updateAdventurer } = useDatabase();
  
  // Helper function to find user by username in adventurers data
  const findUserByUsername = (adventurers, username) => {
    return adventurers?.find(adventurer => 
      adventurer.username?.toLowerCase() === username?.toLowerCase()
    ) || null;
  };

  function signup(fullName, email, password) {
    // ============================================================================
    // TODO: Replace with Azure API call to PostgreSQL backend
    // ============================================================================
    // Expected API endpoint: POST https://your-app.azurewebsites.net/api/auth/signup
    // Expected PostgreSQL table: users
    // Expected columns: id, full_name, email, password_hash, created_at, updated_at
    //
    // Implementation example:
    // const response = await fetch('https://your-app.azurewebsites.net/api/auth/signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ fullName, email, password })
    // });
    // const data = await response.json();
    // if (data.success) {
    //   dispatch({ type: "signup", payload: { user: data.user, email, password } });
    // }
    // ============================================================================
    dispatch({ type: "signup", payload: { user: fullName, email, password } });
  }

  async function login(username, password) {
    dispatch({ type: "set_loading", payload: true });
    
    try {
      // ============================================================================
      // TODO: Replace with Azure API call to PostgreSQL backend for authentication
      // ============================================================================
      // Expected API endpoint: POST https://your-app.azurewebsites.net/api/auth/login
      // Expected PostgreSQL query:
      // SELECT id, username, password, profilePicture
      // FROM Adventurer
      // WHERE username = $1 AND password = crypt($2, password);
      // ============================================================================

      // Ensure we have adventurer data
      if (!adventurers || adventurers.length === 0) {
        await fetchAdventurers();
      }
      
      // if (__DEV__) {
      //   console.log('Adventurers:');
      //   console.log(adventurers);
      //   console.log('Login attempt for username:', username);
      //   console.log('Available adventurers:', adventurers?.length || 0);
      // }
      
      // Try to find user in database
      let foundUser = findUserByUsername(adventurers, username);
      
      if (!foundUser) {
        // For demo purposes, create user if not found
        // if (__DEV__) {
        //   console.log('User not found, creating demo user:', username);
        // }
        // Use a smaller ID that fits in PostgreSQL INTEGER range
        const demoId = Math.floor(Math.random() * 1000000) + 10000; // Random ID between 10000-1010000
        foundUser = {
          id: demoId,
          username: username,
          password: password, // In real implementation, this would be hashed
          profilePicture: null,
        };
        
        // Note: Not creating in database - this is just for local demo authentication
        // if (__DEV__) {
        //   console.log('Created demo user with ID:', demoId);
        // }
      } else {
        // In real implementation, verify password here
        if (__DEV__) {
          console.log('Found existing user:', foundUser.username);
        }
      }
      
      // Store auth token in secure storage (for demo)
      await SecureStore.setItemAsync('authToken', 'demo-token-' + Date.now());
      
      dispatch({ 
        type: "login", 
        payload: { 
          user: foundUser, 
          email: null // Email can be set separately
        } 
      });
      
      return { success: true, user: foundUser };
      
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: "set_loading", payload: false });
      return { success: false, error: error.message };
    }
  }

  function editUsername(newUsername) {
    // ============================================================================
    // TODO: Update username via Azure API call to PostgreSQL backend
    // ============================================================================
    // Expected API endpoint: PATCH https://your-app.azurewebsites.net/api/users/{userId}
    // Expected PostgreSQL query:
    // UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2;
    //
    // Implementation example:
    // await fetch(`https://your-app.azurewebsites.net/api/users/${userId}`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${authToken}`
    //   },
    //   body: JSON.stringify({ fullName: newUsername })
    // });
    // ============================================================================
    dispatch({ type: "edit/username", payload: newUsername });
  }
  function editEmail(newEmail) {
    // ============================================================================
    // TODO: Upload image to Azure Blob Storage and update user profile
    // ============================================================================
    // Expected Azure Blob Storage container: profile-images
    // Expected API endpoint: POST https://your-app.azurewebsites.net/api/users/{userId}/image
    // Expected PostgreSQL query:
    // UPDATE users SET profile_image_url = $1, updated_at = NOW() WHERE id = $2;
    //
    // Implementation example:
    // 1. Upload to Azure Blob Storage
    // const blobUrl = await uploadToAzureBlob(imageURL);
    //
    // 2. Update user profile in PostgreSQL
    // await fetch(`https://your-app.azurewebsites.net/api/users/${userId}/image`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${authToken}`
    //   },
    //   body: JSON.stringify({ imageUrl: blobUrl })
    // });
    // ============================================================================
    dispatch({ type: "edit/email", payload: newEmail });
  }

  async function logout() {
    try {
      // remove any stored auth tokens if present
      await SecureStore.deleteItemAsync("authToken");
    } catch (e) {
      // ignore
    }
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (e) {
      // ignore
    }

    dispatch({ type: "logout" });

    // navigate to login/sign-in route
    try {
      router.replace("/login");
    } catch (e) {
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
        
        // Authentication functions
        login,
        signup,
        logout,
        
        // Profile management functions
        editUsername,
        editEmail,
        
        // Helper functions for database integration
        findUserByUsername,
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

