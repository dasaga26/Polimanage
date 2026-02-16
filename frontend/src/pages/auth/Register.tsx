// ============================================================
// REGISTER PAGE - Página de registro
// ============================================================

import { useEffect } from "react";
import SignInForm from "../../components/auth/SignInForm";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { isCorrect, useRegister, errorMSG } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCorrect) {
      navigate('/');
    }
  }, [isCorrect, navigate]);

  return (
    <SignInForm 
      form_type="register"
      sendData={useRegister} 
      errorMSG={errorMSG}
    />
  );
}

export default Register;
