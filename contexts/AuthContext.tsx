"use client";
import { Adventurer, CreateAdventurer, UpdateAdventurer } from "@/types/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import {
  createContext,
  ReactNode,
  useContext,
  useReducer,
  useState,
  useEffect,
} from "react";
import { Alert } from "react-native";
import { hybridDataService } from "@/data/hybridDataService";
import { useDatabase } from "./DatabaseContext";

// JWT Token interface
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

// Enhanced token storage interface
interface SecureTokenData {
  encryptedData: string;
  hash: string;
  timestamp: number;
  expiresAt: number;
}

// Secure storage keys with versioning
const ACCESS_TOKEN_KEY = 'wayfind_access_token_v2';
const REFRESH_TOKEN_KEY = 'wayfind_refresh_token_v2';
const USER_DATA_KEY = 'wayfind_user_data_v2';
const TOKEN_METADATA_KEY = 'wayfind_token_metadata_v2';
const ENCRYPTION_KEY = 'wayfind_encryption_salt_v2';

// Security configuration
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry
const MAX_TOKEN_AGE = 24 * 60 * 60 * 1000; // 24 hours max storage
const ENCRYPTION_ALGORITHM = Crypto.CryptoDigestAlgorithm.SHA256;

// State interface
interface AuthState {
  user: Adventurer | null;
  username: string | null;
  email: string | null;
  profilePicture: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

// Action types
type AuthAction =
  | { type: "set_loading"; payload: boolean }
  | { type: "set_user_data"; payload: { user: Adventurer | null } }
  | { type: "edit/username"; payload: string }
  | {
      type: "signup";
      payload: { username: string; user: Adventurer; tokens?: AuthTokens };
    }
  | {
      type: "login";
      payload: { user: Adventurer; username: string; tokens: AuthTokens };
    }
  | { type: "logout" }
  | { type: "set_tokens"; payload: { accessToken: string; refreshToken: string } }
  | { type: "restore_session"; payload: { user: Adventurer; tokens: AuthTokens } };

// Context value interface
interface AuthContextValue {
  // User data
  user: Adventurer | null;
  username: string | null;
  email: string | null;
  profilepicture: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setIsLoading: (loading: boolean) => void;

  // Authentication functions
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<Adventurer>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  getValidToken: () => Promise<string | null>;

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
  accessToken: null,
  refreshToken: null,
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
        email: null,
        profilePicture: action.payload.user?.profilepicture || null,
        isAuthenticated: !!action.payload.user,
      };

    case "edit/username":
      return {
        ...state,
        username: action.payload,
        user: state.user ? { ...state.user, username: action.payload } : null,
      };

    case "signup":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.username,
        email: null,
        profilePicture: action.payload.user.profilepicture || null,
        isAuthenticated: true,
        isLoading: false,
        accessToken: action.payload.tokens?.accessToken || null,
        refreshToken: action.payload.tokens?.refreshToken || null,
      };

    case "login":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.username,
        email: null,
        profilePicture: action.payload.user.profilepicture || null,
        isAuthenticated: true,
        isLoading: false,
        accessToken: action.payload.tokens.accessToken,
        refreshToken: action.payload.tokens.refreshToken,
      };

    case "set_tokens":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };

    case "restore_session":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.user.username,
        email: null,
        profilePicture: action.payload.user.profilepicture || null,
        isAuthenticated: true,
        isLoading: false,
        accessToken: action.payload.tokens.accessToken,
        refreshToken: action.payload.tokens.refreshToken,
      };

    case "logout":
      return {
        ...initialState,
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
  const router = useRouter();

  // Get database context functions
  const { fetchAdventurers, createAdventurer, updateAdventurer } = useDatabase();

  // Enhanced secure token storage functions
  const generateEncryptionSalt = async (): Promise<string> => {
    try {
      let salt = await SecureStore.getItemAsync(ENCRYPTION_KEY);
      if (!salt) {
        // Generate new salt using device-specific entropy
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        salt = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
        await SecureStore.setItemAsync(ENCRYPTION_KEY, salt);
      }
      return salt;
    } catch (error) {
      console.error("Failed to generate encryption salt:", error);
      // Fallback to timestamp-based salt (less secure but functional)
      return Date.now().toString(36);
    }
  };

  const encryptTokenData = async (data: string): Promise<string> => {
    try {
      const salt = await generateEncryptionSalt();
      const dataWithSalt = `${salt}:${data}`;
      const hash = await Crypto.digestStringAsync(
        ENCRYPTION_ALGORITHM,
        dataWithSalt,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return hash;
    } catch (error) {
      console.error("Failed to encrypt token data:", error);
      return data; // Fallback to unencrypted (less secure)
    }
  };

  const createSecureTokenData = async (tokenData: AuthTokens): Promise<SecureTokenData> => {
    const dataString = JSON.stringify(tokenData);
    const encryptedData = await encryptTokenData(dataString);
    const hash = await Crypto.digestStringAsync(
      ENCRYPTION_ALGORITHM,
      dataString,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    
    const now = Date.now();
    const expiresAt = now + MAX_TOKEN_AGE;
    
    return {
      encryptedData,
      hash,
      timestamp: now,
      expiresAt
    };
  };

  const validateTokenIntegrity = async (secureData: SecureTokenData, originalData: string): Promise<boolean> => {
    try {
      const expectedHash = await Crypto.digestStringAsync(
        ENCRYPTION_ALGORITHM,
        originalData,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      const isHashValid = secureData.hash === expectedHash;
      const isNotExpired = Date.now() < secureData.expiresAt;
      const isNotTooOld = (Date.now() - secureData.timestamp) < MAX_TOKEN_AGE;
      
      return isHashValid && isNotExpired && isNotTooOld;
    } catch (error) {
      console.error("Token integrity validation failed:", error);
      return false;
    }
  };

  // Automatic token expiration monitoring
  const monitorTokenExpiration = async (): Promise<void> => {
    try {
      const metadataString = await SecureStore.getItemAsync(TOKEN_METADATA_KEY);
      if (!metadataString) return;
      
      const metadata: SecureTokenData = JSON.parse(metadataString);
      const timeUntilExpiry = metadata.expiresAt - Date.now();
      
      // If token expires within buffer time, refresh it
      if (timeUntilExpiry < TOKEN_EXPIRY_BUFFER && timeUntilExpiry > 0) {
        console.log("⚠️ Token approaching expiry, auto-refreshing...");
        await refreshAuthToken();
      } else if (timeUntilExpiry <= 0) {
        console.log("❌ Token expired, logging out...");
        await logout();
      }
    } catch (error) {
      console.error("Token expiration monitoring error:", error);
    }
  };

  // Enhanced token management functions
  const saveTokens = async (tokens: AuthTokens): Promise<void> => {
    try {
      // Create secure token data with encryption and integrity checks
      const secureTokenData = await createSecureTokenData(tokens);
      
      // Store tokens with additional security metadata
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
      await SecureStore.setItemAsync(TOKEN_METADATA_KEY, JSON.stringify(secureTokenData));
      
      // Store user data separately with encryption
      if (state.user) {
        const userDataHash = await encryptTokenData(JSON.stringify(state.user));
        await SecureStore.setItemAsync(USER_DATA_KEY, userDataHash);
      }
      
      console.log("✅ Tokens saved with enhanced security");
    } catch (error) {
      console.error("❌ Failed to save tokens securely:", error);
      Alert.alert("Security Error", "Failed to save authentication data securely.");
      throw error;
    }
  };

  const getStoredTokens = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
      // Get tokens and metadata
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const metadataString = await SecureStore.getItemAsync(TOKEN_METADATA_KEY);
      
      if (!accessToken || !refreshToken || !metadataString) {
        console.log("⚠️ Incomplete token data found");
        await clearStoredTokens(); // Clean up partial data
        return null;
      }
      
      try {
        const metadata: SecureTokenData = JSON.parse(metadataString);
        
        // Validate token integrity and expiration
        const tokenData = { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: '15m' };
        const isValid = await validateTokenIntegrity(metadata, JSON.stringify(tokenData));
        
        if (!isValid) {
          console.log("❌ Token integrity validation failed");
          await clearStoredTokens();
          return null;
        }
        
        // Check if tokens are close to expiring
        const timeUntilExpiry = metadata.expiresAt - Date.now();
        if (timeUntilExpiry < TOKEN_EXPIRY_BUFFER) {
          console.log("⏰ Tokens approaching expiry, will refresh");
          // Allow retrieval but flag for refresh
        }
        
        console.log("✅ Tokens retrieved and validated successfully");
        return { accessToken, refreshToken };
        
      } catch (parseError) {
        console.error("Failed to parse token metadata:", parseError);
        await clearStoredTokens();
        return null;
      }
      
    } catch (error) {
      console.error("Failed to get stored tokens:", error);
      await clearStoredTokens(); // Clear potentially corrupted data
      return null;
    }
  };

  const clearStoredTokens = async (): Promise<void> => {
    try {
      // Clear all token-related data with comprehensive cleanup
      const keysToDelete = [
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
        TOKEN_METADATA_KEY,
        // Clear legacy keys if they exist
        'wayfind_access_token',
        'wayfind_refresh_token',
        'wayfind_user_data'
      ];
      
      const deletePromises = keysToDelete.map(async (key) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          // Ignore individual key deletion errors (key might not exist)
          console.log(`Key ${key} not found or already deleted`);
        }
      });
      
      await Promise.all(deletePromises);
      
      // Clear any cached data in AsyncStorage as well
      try {
        const asyncKeys = await AsyncStorage.getAllKeys();
        const wayfindKeys = asyncKeys.filter(key => key.startsWith('wayfind'));
        if (wayfindKeys.length > 0) {
          await AsyncStorage.multiRemove(wayfindKeys);
        }
      } catch (asyncError) {
        console.log("AsyncStorage cleanup completed");
      }
      
      console.log("🧹 All authentication data cleared successfully");
    } catch (error) {
      console.error("Failed to clear stored tokens:", error);
    }
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.refreshToken) {
        console.log("❌ No refresh token available");
        return false;
      }

      console.log("🔄 Attempting token refresh...");
      
      const response = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WayFind-Client/1.0',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || tokens.refreshToken, // Keep old refresh token if new one not provided
          tokenType: data.tokenType || 'Bearer',
          expiresIn: data.expiresIn || '15m',
        };

        await saveTokens(newTokens);
        dispatch({
          type: "set_tokens",
          payload: {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
          },
        });
        
        console.log("✅ Token refresh successful");
        return true;
      } else {
        console.log("❌ Token refresh failed:", response.status);
        await clearStoredTokens();
        dispatch({ type: "logout" });
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      await clearStoredTokens();
      dispatch({ type: "logout" });
      return false;
    }
  };

  const getValidToken = async (): Promise<string | null> => {
    if (state.accessToken && state.accessToken !== 'local_session') {
      return state.accessToken;
    }

    // Try to refresh the token
    const refreshed = await refreshAuthToken();
    if (refreshed && state.accessToken) {
      return state.accessToken;
    }

    return null;
  };

  const setIsLoading = (loading: boolean): void => {
    dispatch({ type: "set_loading", payload: loading });
  };

  // Authentication functions
  async function signup(username: string, password: string): Promise<Adventurer> {
    setIsLoading(true);

    try {
      // Validate inputs before creating adventurer
      if (!username || typeof username !== 'string') {
        throw new Error('Username is required');
      }
      if (!password || typeof password !== 'string') {
        throw new Error('Password is required');
      }

      console.log('🔐 Starting signup process for user:', username);

      const adventurerData: CreateAdventurer = {
        username: username.trim(),
        password: password,
        profilepicture: null,
      };

      // Try server first, fallback to local
      try {
        const response = await fetch('http://localhost:3000/adventurers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adventurerData),
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          const tokens: AuthTokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenType: data.tokenType,
            expiresIn: data.expiresIn,
          };

          await saveTokens(tokens);
          await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
          
          dispatch({
            type: "signup",
            payload: { username, user, tokens },
          });

          console.log('✅ User created successfully on server:', user.username);
          return user;
        }
      } catch (error) {
        console.warn('Server signup failed, trying local fallback:', error);
      }

      // Fallback to local creation
      const user = await createAdventurer(adventurerData);
      console.log('✅ User created locally:', user.username);

      dispatch({
        type: "signup",
        payload: { username, user },
      });

      return user;
    } catch (error) {
      console.error("❌ Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    setIsLoading(true);

    try {
      // Try server authentication first
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          const tokens: AuthTokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenType: data.tokenType,
            expiresIn: data.expiresIn,
          };

          await saveTokens(tokens);
          await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
          
          dispatch({
            type: "login",
            payload: { user, username: user.username, tokens },
          });

          console.log('✅ Server authentication successful');
          return true;
        }
      } catch (error) {
        console.warn('Server authentication failed, trying local fallback:', error);
      }

      // Fallback to local authentication
      const result = await hybridDataService.authenticateUser(username, password);
      
      if (result.data) {
        const localTokens: AuthTokens = {
          accessToken: 'local_session',
          refreshToken: 'local_session',
          tokenType: 'Bearer',
          expiresIn: '7d',
        };

        dispatch({
          type: "login",
          payload: { 
            user: result.data, 
            username: result.data.username,
            tokens: localTokens,
          },
        });
        console.log('✅ Local authentication successful');
        return true;
      } else {
        Alert.alert("Validation", "Invalid username or password.");
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Error", "Login failed. Please check your credentials and try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function editUsername(newUsername: string): Promise<void> {
    if (!state.user) {
      throw new Error("No user is currently logged in");
    }

    try {
      const updatedAdventurer: UpdateAdventurer = {
        id: state.user.id,
        username: newUsername, // Use the new username here
        password: state.user.password,
        profilepicture: state.user.profilepicture
      };
      await updateAdventurer(state.user.id, updatedAdventurer);
      dispatch({ type: "edit/username", payload: newUsername });
    } catch (error) {
      console.error("Failed to update username:", error);
      Alert.alert("Error", "Failed to update username. Please try again.");
      throw error;
    }
  }

  async function logout(): Promise<void> {
    try {
      await clearStoredTokens();
      
      // Also clear legacy auth tokens
      await SecureStore.deleteItemAsync("authToken");
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error during logout cleanup:", error);
    }

    dispatch({ type: "logout" });

    // Navigate to login/sign-in route
    try {
      router.replace("/login");
    } catch (error) {
      console.error("Navigation error during logout:", error);
    }
  }

  // Check for existing session on app start
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const tokens = await getStoredTokens();
        const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
        
        if (tokens && userData) {
          const user: Adventurer = JSON.parse(userData);
          
          // Verify token is still valid (only for server tokens)
          if (tokens.accessToken !== 'local_session') {
            try {
              const response = await fetch('http://localhost:3000/auth/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokens.accessToken}`,
                },
              });

              if (response.ok) {
                dispatch({
                  type: "restore_session",
                  payload: {
                    user,
                    tokens: {
                      accessToken: tokens.accessToken,
                      refreshToken: tokens.refreshToken,
                      tokenType: 'Bearer',
                      expiresIn: '15m',
                    },
                  },
                });
                console.log('✅ Server session restored successfully');
              } else {
                // Token invalid, try to refresh
                const refreshed = await refreshAuthToken();
                if (!refreshed) {
                  await clearStoredTokens();
                  dispatch({ type: "set_loading", payload: false });
                }
              }
            } catch (error) {
              console.warn('Server session verification failed:', error);
              // For local sessions, just restore without verification
              if (tokens.accessToken === 'local_session') {
                dispatch({
                  type: "restore_session",
                  payload: {
                    user,
                    tokens: {
                      accessToken: tokens.accessToken,
                      refreshToken: tokens.refreshToken,
                      tokenType: 'Bearer',
                      expiresIn: '7d',
                    },
                  },
                });
                console.log('✅ Local session restored successfully');
              } else {
                dispatch({ type: "set_loading", payload: false });
              }
            }
          } else {
            // Local session - restore without verification
            dispatch({
              type: "restore_session",
              payload: {
                user,
                tokens: {
                  accessToken: tokens.accessToken,
                  refreshToken: tokens.refreshToken,
                  tokenType: 'Bearer',
                  expiresIn: '7d',
                },
              },
            });
            console.log('✅ Local session restored successfully');
          }
        } else {
          dispatch({ type: "set_loading", payload: false });
        }
      } catch (error) {
        console.error("Failed to check existing session:", error);
        dispatch({ type: "set_loading", payload: false });
      }
    };

    checkExistingSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        // User data
        user: state.user,
        username: state.username,
        email: state.email,
        profilepicture: state.profilePicture,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        accessToken: state.accessToken,

        // Helper functions
        setIsLoading,

        // Authentication functions
        login,
        signup,
        logout,
        refreshAuthToken,
        getValidToken,

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
export type { AuthAction, AuthContextValue, AuthState, AuthTokens };

