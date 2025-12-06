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
  image: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  console.log(action.payload);
  switch (action.type) {
    case "edit/username":
      return { ...state, username: action.payload };
    case "edit/email":
      return { ...state, email: action.payload };
    case "signup":
      return {
        ...state,
        username: action.payload.username,
        user: action.payload.user,
        email: action.payload.email,

        isAuthenticated: true,
      };
    case "login":
      return {
        ...state,
        user: action.payload.user,
        username: action.payload.username,
        email: action.payload.email,
        isAuthenticated: true,
      };
    case "logout":
      return {
        ...state,
        user: null,
        username: null,
        email: null,
        password: null,
        isAuthenticated: false,
      };
    default:
      throw Error("Unkown Action.");
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, email, username, isAuthenticated } = state;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { createAdventurer, fetchAdventurers, updateAdventurer } =
    useDatabase();

  async function signup(fullName, email, password) {
    // const BCRYPT_ROUNDS = 8; //Change to 13 to improve efficiency

    // const passwordHash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

    //TODO: Add loader while password is loading
    //Make image field optional

    const res = await createAdventurer({
      username: fullName,
      password,
      profilePicture: null,
    });

    const data = await fetchAdventurers();

    const user = data.find((el) => el.id === res.id);

    // console.log(data);
    dispatch({
      type: "signup",
      payload: { username: fullName, email, user },
    });
  }

  async function login(email, password) {
    // ============================================================================
    // TODO: Replace with Azure API call to PostgreSQL backend
    // ============================================================================
    // Expected API endpoint: POST https://your-app.azurewebsites.net/api/auth/login
    // Expected PostgreSQL query:
    // SELECT id, full_name, email, profile_image_url
    // FROM users
    // WHERE email = $1 AND password_hash = crypt($2, password_hash);
    //
    // Implementation example:
    // const response = await fetch('https://your-app.azurewebsites.net/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // const data = await response.json();
    // if (data.success) {
    //   // Store auth token in secure storage
    //   await SecureStore.setItemAsync('authToken', data.token);
    //   dispatch({ type: "login", payload: data.user.full_name });
    // }
    // ============================================================================

    // TEMPORARY: Extract username from email for demo purposes
    const res = await fetchAdventurers();
    // console.log(res);
    const user = res.find((el) => el.username === email);

    if (user) {
      if (user.password === password)
        dispatch({
          type: "login",
          payload: { user, username: user.username, email },
        });
      else Alert.alert("Validation", "Invalid Password.");
    } else {
      Alert.alert(
        "Validation",
        "Account not found, sign up with the link below."
      );
    }
  }

  async function editUsername(newUsername) {
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
    // console.log("here", user.id);
    const res = await updateAdventurer(user.id, { username: newUsername });
    // console.log("email :", res);
    dispatch({ type: "edit/username", payload: newUsername });
  }
  async function editEmail(newEmail) {
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

    await updateAdventurer(user.id, { email: newEmail });

    dispatch({ type: "edit/email", payload: newEmail });
  }

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
        user,
        username,
        email,
        isAuthenticated,
        login,
        editUsername,
        editEmail,
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
