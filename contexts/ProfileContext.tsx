import { createContext, useContext, useReducer, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { Adventurer } from "@/types/database";

// State interface
interface ProfileState {
  image: string | null;
}

// Action types
type ProfileAction =
  | { type: "edit/image"; payload: string | null }
  | { type: "logout" };

// Context value interface
interface ProfileContextValue {
  user: Adventurer | null;
  username: string | null;
  email: string | null;
  image: string | null;
  editUsername: (newUsername: string) => Promise<void>;
  editImage: (imageURL: string | null) => void;
  logout: () => void;
}

const initialState: ProfileState = {
  image: null,
};

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

function reducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case "edit/image":
      return { ...state, image: action.payload };
    case "logout":
      return {
        ...state,
        image: null,
      };
    default:
      return state;
  }
}

interface ProfileProviderProps {
  children: ReactNode;
}

function ProfileProvider({ children }: ProfileProviderProps) {
  const { user, username, email, editUsername } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { image } = state;

  function editImage(imageURL: string | null): void {
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

  function logout(): void {
    dispatch({ type: "logout" });
  }

  return (
    <ProfileContext.Provider
      value={{
        user,
        username,
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

function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);

  if (context === undefined)
    throw new Error("useProfile was used outside the ProfileProvider");
  return context;
}

export { ProfileProvider, useProfile };
