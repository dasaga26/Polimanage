// ============================================================
// LOGIN PAGE - Página de inicio de sesión
// ============================================================

import SignInForm from "../../components/auth/SignInForm";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const { useLogin, errorMSG } = useAuth();

  return (
    <SignInForm 
      form_type="login"
      sendData={useLogin} 
      errorMSG={errorMSG}
    />
  );
}

export default Login;
