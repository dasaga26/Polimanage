// ============================================================
// LOGIN PAGE - Página de inicio de sesión
// ============================================================

import { useEffect } from "react";
import SignInForm from "../../components/auth/SignInForm";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { isCorrect, useLogin, errorMSG } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCorrect) {
      navigate('/');
    }
  }, [isCorrect, navigate]);

  return (
    <SignInForm 
      form_type="login"
      sendData={useLogin} 
      errorMSG={errorMSG}
    />
  );
}

export default Login;
