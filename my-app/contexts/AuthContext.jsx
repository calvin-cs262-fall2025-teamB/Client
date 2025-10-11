import { createContext, useContext, useReducer, useState } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  email: null,
  password: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "signup":
      return {
        ...state,
        user: action.payload.user,
        email: action.payload.email,
        password: action.payload.password,
        isAuthenticated: true,
      };
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
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

const FAKE_USER = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated } = state;
  const [isLoading, setIsLoading] = useState(false);
  //   console.log("Auth State:", state);

  function signup(fullName, email, password) {
    dispatch({ type: "signup", payload: { user: fullName, email, password } });
  }
  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password)
      dispatch({ type: "login", payload: FAKE_USER });
  }
  function logout() {
    dispatch({ type: "logout" });
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        signup,
        isLoading,
        setIsLoading,
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
