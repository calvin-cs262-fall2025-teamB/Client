import { createContext, useContext, useReducer, useState } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  email: null,
  password: null,
  // TODO: figure out how to store image urls
  image: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  console.log(action.payload);
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

  function signup(fullName, email, password) {
    dispatch({ type: "signup", payload: { user: fullName, email, password } });
  }
  function login(email, password) {
    //TODO: undo comment
    // if (email === FAKE_USER.email && password === FAKE_USER.password)
    //   dispatch({ type: "login", payload: FAKE_USER });
    dispatch({ type: "login", payload: "Beautiful BOYS" });
  }
  function editUsername(newUsername) {
    dispatch({ type: "edit/username", payload: newUsername });
  }
  function editImage(imageURL) {
    dispatch({ type: "edit/image", payload: imageURL });
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
        editUsername,
        editImage,
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
