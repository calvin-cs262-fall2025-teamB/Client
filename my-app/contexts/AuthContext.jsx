import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  email: null,
  token: null,
  image: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check for existing token
};

function reducer(state, action) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case "edit/username":
      return { ...state, user: action.payload };
    case "edit/image":
      return { ...state, image: action.payload };
    case "signup":
      return {
        ...state,
        user: action.payload.user,
        email: action.payload.email,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "login":
      return { 
        ...state, 
        user: action.payload.user,
        email: action.payload.email,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "logout":
      return {
        ...state,
        user: null,
        email: null,
        token: null,
        isAuthenticated: false,
      };
    case "restore_token":
      return {
        ...state,
        user: action.payload.user,
        email: action.payload.email,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "set_loading":
      return { ...state, isLoading: action.payload };
    default:
      throw Error("Unknown Action: " + action.type);
  }
}

const FAKE_USER = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated, token, isLoading } = state;

  // Check for existing token on app start
  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        dispatch({ 
          type: "restore_token", 
          payload: { 
            token: storedToken,
            user: userData.user,
            email: userData.email 
          } 
        });
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
    } finally {
      dispatch({ type: "set_loading", payload: false });
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      dispatch({ type: "set_loading", payload: true });
      
      // Try real API call first
      const response = await fetch('https://cs262beautifulguys.azurewebsites.net/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store token and user data
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify({ 
          user: data.user.full_name, 
          email: data.user.email 
        }));
        
        dispatch({ 
          type: "signup", 
          payload: { 
            user: data.user.full_name, 
            email: data.user.email,
            token: data.token 
          } 
        });
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Fallback for development - create fake user if API fails
      if (__DEV__) {
        console.log('API failed, creating fake user account');
        const fakeToken = 'fake-jwt-token-signup-' + Date.now();
        
        await AsyncStorage.setItem('authToken', fakeToken);
        await AsyncStorage.setItem('userData', JSON.stringify({ 
          user: fullName, 
          email: email 
        }));
        
        dispatch({ 
          type: "signup", 
          payload: { 
            user: fullName, 
            email: email,
            token: fakeToken 
          } 
        });
        dispatch({ type: "set_loading", payload: false });
        return;
      }
      
      throw error;
    } finally {
      dispatch({ type: "set_loading", payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: "set_loading", payload: true });
      
      // Check for fake user first (for development/testing)
      if (email === FAKE_USER.email && password === FAKE_USER.password) {
        const fakeToken = 'fake-jwt-token-' + Date.now();
        
        // Store fake token and user data
        await AsyncStorage.setItem('authToken', fakeToken);
        await AsyncStorage.setItem('userData', JSON.stringify({ 
          user: FAKE_USER.name, 
          email: FAKE_USER.email 
        }));
        
        dispatch({ 
          type: "login", 
          payload: { 
            user: FAKE_USER.name,
            email: FAKE_USER.email,
            token: fakeToken 
          } 
        });
        dispatch({ type: "set_loading", payload: false });
        return; // Exit early for fake user
      }
      
      // Try real API call
      const response = await fetch('https://cs262beautifulguys.azurewebsites.net/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store token and user data
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify({ 
          user: data.user.full_name, 
          email: data.user.email 
        }));
        
        dispatch({ 
          type: "login", 
          payload: { 
            user: data.user.full_name,
            email: data.user.email,
            token: data.token 
          } 
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to fake user in development if API fails
      if (__DEV__ && email === FAKE_USER.email && password === FAKE_USER.password) {
        console.log('API failed, using fake user fallback');
        const fakeToken = 'fake-jwt-token-fallback-' + Date.now();
        
        await AsyncStorage.setItem('authToken', fakeToken);
        await AsyncStorage.setItem('userData', JSON.stringify({ 
          user: FAKE_USER.name, 
          email: FAKE_USER.email 
        }));
        
        dispatch({ 
          type: "login", 
          payload: { 
            user: FAKE_USER.name,
            email: FAKE_USER.email,
            token: fakeToken 
          } 
        });
        dispatch({ type: "set_loading", payload: false });
        return;
      }
      
      throw error;
    } finally {
      dispatch({ type: "set_loading", payload: false });
    }
  };

  const logout = async () => {
    try {
      // Remove stored token and user data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      dispatch({ type: "logout" });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to get auth token - this is what you need for API calls
  const getAuthToken = async () => {
    if (token) {
      return token;
    }
    
    // Fallback to AsyncStorage if token not in state
    const storedToken = await AsyncStorage.getItem('authToken');
    return storedToken;
  };

  // Debug function to skip login sequence - DEVELOPMENT ONLY
  const debugLogin = async () => {
    if (!__DEV__) {
      console.warn('Debug login only available in development mode');
      return;
    }

    try {
      dispatch({ type: "set_loading", payload: true });
      
      const debugToken = 'debug-jwt-token-' + Date.now();
      const debugUser = {
        user: 'Debug User',
        email: 'debug@example.com'
      };
      
      // Store debug token and user data
      await AsyncStorage.setItem('authToken', debugToken);
      await AsyncStorage.setItem('userData', JSON.stringify(debugUser));
      
      dispatch({ 
        type: "login", 
        payload: { 
          user: debugUser.user,
          email: debugUser.email,
          token: debugToken 
        } 
      });
      
      console.log('🚀 Debug login successful - skipped authentication');
    } catch (error) {
      console.error('Debug login error:', error);
      dispatch({ type: "set_loading", payload: false });
    }
  };

  const editUsername = async (newUsername) => {
    try {
      const authToken = await getAuthToken();
      
      const response = await fetch(`https://cs262beautifulguys.azurewebsites.net/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ fullName: newUsername })
      });
      
      if (response.ok) {
        dispatch({ type: "edit/username", payload: newUsername });
        
        // Update stored user data
        const userData = { user: newUsername, email: state.email };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Edit username error:', error);
      throw error;
    }
  };

  const editImage = async (imageURL) => {
    try {
      const authToken = await getAuthToken();
      
      const response = await fetch(`https://cs262beautifulguys.azurewebsites.net/api/users/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ imageUrl: imageURL })
      });
      
      if (response.ok) {
        dispatch({ type: "edit/image", payload: imageURL });
      }
    } catch (error) {
      console.error('Edit image error:', error);
      throw error;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        login,
        signup,
        editUsername,
        editImage,
        logout,
        getAuthToken, // Export this function for API calls
        debugLogin, // Debug function to skip login - DEVELOPMENT ONLY
        isLoading,
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

