import { createContext, useContext, useReducer, useState } from "react";

const ProfileContext = createContext();

const initialState = {
  user: null,
  email: null,
  image: null,
};

function reducer(state, action) {
  console.log(action.payload);
  switch (action.type) {
    case "edit/username":
      return { ...state, user: action.payload };
    case "edit/image":
      return { ...state, image: action.payload };
    case "save/profile":
      return {
        ...state,
        user: action.payload.user,
        email: action.payload.email,
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

function ProfileProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, image, email } = state;
  const [isLoading, setIsLoading] = useState(false);

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
        logout,
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
