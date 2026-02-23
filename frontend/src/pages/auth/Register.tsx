// ============================================================
// REGISTER PAGE - Página de registro
// ============================================================

import SignInForm from "../../components/auth/SignInForm";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const { useRegister, errorMSG } = useAuth();

  return (
    <SignInForm 
      form_type="register"
      sendData={useRegister} 
      errorMSG={errorMSG}
    />
  );
}

export default Register;
