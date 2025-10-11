//TODO: Optimize by making one component for login and sign in
import SignIn from "../../components/authentication/Signin";
import { AuthProvider } from "../../contexts/AuthContext";

export default function Authenticate() {
  return (
    <AuthProvider>
      <SignIn />
    </AuthProvider>
  );
}
