import { createContext, useContext, useReducer, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const initialState = {
  image: null,
};

const ProfileContext = createContext();

function reducer(state, action) {
  // console.log(action.payload);
  switch (action.type) {
    case "edit/image":
      return { ...state, image: action.payload };
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

function ProfileProvider({ children }) {
  const { user, email, editEmail, editUsername } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { image } = state;

  const [isLoading, setIsLoading] = useState(false);

  function editImage(imageURL) {
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
    dispatch({ type: "edit/image", payload: imageURL });
  }

  function logout() {
    dispatch({ type: "logout" });
  }
  return (
    <ProfileContext.Provider
      value={{
        user,
        email,
        image,
        editUsername,
        editImage,
        editEmail,
        logout,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

function useProfile() {
  const context = useContext(ProfileContext);

  if (context === undefined)
    throw new Error("Context was used outside the AuthProvider");
  return context;
}

export { ProfileProvider, useProfile };
