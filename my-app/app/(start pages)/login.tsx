//Custom libraries and components
import Login from "../../components/authentication/Login";
import { AuthProvider } from "../../contexts/AuthContext";

export default function Authenticate() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
