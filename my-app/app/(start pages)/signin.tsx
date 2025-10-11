//TODO: Optimize by making one component for login and sign in
import Signup from "../../components/authentication/Signup";
import { AuthProvider } from "../../contexts/AuthContext";

export default function Authenticate() {
  return (
    <AuthProvider>
      <Signup />
    </AuthProvider>
  );
}
