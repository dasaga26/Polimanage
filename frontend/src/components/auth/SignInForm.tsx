// ============================================================
// SIGN IN FORM - Formulario de Login/Register
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff, Check, X, Dumbbell } from 'lucide-react';
import type { LoginCredentials, RegisterData, AuthCallbacks } from '../../types/authTypes';

interface LoginFormProps {
    form_type: 'login';
    sendData: (data: LoginCredentials, callbacks?: AuthCallbacks) => Promise<void>;
    errorMSG: string | null;
}

interface RegisterFormProps {
    form_type: 'register';
    sendData: (data: RegisterData, callbacks?: AuthCallbacks) => Promise<void>;
    errorMSG: string | null;
}

type SignInFormProps = LoginFormProps | RegisterFormProps;

const SignInForm: React.FC<SignInFormProps> = ({ form_type, sendData, errorMSG }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
    });
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Limpiar errores cuando el usuario empieza a escribir
        if (validationError) setValidationError(null);
        
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // OBLIGATORIAMENTE LA PRIMERA LÍNEA
        
        setValidationError(null);
        setIsSubmitting(true);

        // Validación de longitud de contraseña
        if (formData.password.length < 6) {
            setValidationError('La contraseña debe tener al menos 6 caracteres');
            setIsSubmitting(false);
            return;
        }

        // Validación específica de register
        if (form_type === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setValidationError('Las contraseñas no coinciden');
                setIsSubmitting(false);
                return;
            }
            if (!formData.fullName.trim()) {
                setValidationError('El nombre completo es obligatorio');
                setIsSubmitting(false);
                return;
            }
        }

        try {
            if (form_type === 'login') {
                await sendData({
                    email: formData.email,
                    password: formData.password,
                } as LoginCredentials, {
                    onSuccess: () => {
                        navigate('/');
                    },
                    onError: (err) => {
                        console.error("Error en login:", err);
                        setIsSubmitting(false);
                    }
                });
            } else {
                await sendData({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phone: formData.phone || undefined,
                } as RegisterData, {
                    onSuccess: () => {
                        navigate('/login');
                    },
                    onError: (err) => {
                        console.error("Error en registro:", err);
                        setIsSubmitting(false);
                    }
                });
            }
        } catch (err) {
            console.error("Error capturado en form:", err);
            setIsSubmitting(false);
        }
    };

    // Validación de fortaleza de contraseña
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Débil', color: 'bg-red-500' };
        if (strength <= 3) return { strength, label: 'Media', color: 'bg-yellow-500' };
        return { strength, label: 'Fuerte', color: 'bg-green-500' };
    };

    const passwordStrength = form_type === 'register' ? getPasswordStrength() : null;

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding & Image (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col justify-center items-start p-16 text-gray-900 max-w-xl mx-auto">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                            <Dumbbell className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">PoliManage</h1>
                            <p className="text-gray-600">Tu centro deportivo</p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-600 p-2 rounded-lg mt-1 shadow-md shadow-blue-600/20">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Reserva tus pistas</h3>
                                <p className="text-gray-600 text-sm">Accede a todas nuestras instalaciones deportivas</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-600 p-2 rounded-lg mt-1 shadow-md shadow-blue-600/20">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Clases grupales</h3>
                                <p className="text-gray-600 text-sm">Únete a nuestras clases con instructores profesionales</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-600 p-2 rounded-lg mt-1 shadow-md shadow-blue-600/20">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Gestión completa</h3>
                                <p className="text-gray-600 text-sm">Administra tus reservas, pagos y membresías en un solo lugar</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <p className="text-sm italic mb-3 text-gray-700">"La mejor plataforma para gestionar mi centro deportivo. Fácil de usar y muy completa."</p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white shadow-md shadow-blue-600/20">
                                JM
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900">Juan Martínez</p>
                                <p className="text-gray-500 text-xs">Gestor Deportivo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                            <Dumbbell className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            PoliManage
                        </h1>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Volver al inicio</span>
                    </button>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {form_type === 'login' ? 'Bienvenido' : 'Crear cuenta'}
                            </h2>
                            <p className="text-gray-600">
                                {form_type === 'login' ? (
                                    <>
                                        ¿No tienes cuenta?{' '}
                                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            Regístrate
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        ¿Ya tienes cuenta?{' '}
                                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            Inicia sesión
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Error Message */}
                        {(errorMSG || validationError) && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3" role="alert">
                                <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700">{validationError || errorMSG}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name - Solo en Register */}
                            {form_type === 'register' && (
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre Completo
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contraseña {form_type === 'register' && <span className="text-gray-500 font-normal">(mínimo 6 caracteres)</span>}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {/* Password Strength Indicator */}
                                {form_type === 'register' && formData.password && passwordStrength && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-all ${
                                                        level <= passwordStrength.strength
                                                            ? passwordStrength.color
                                                            : 'bg-gray-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Seguridad: <span className="font-semibold">{passwordStrength.label}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password - Solo en Register */}
                            {form_type === 'register' && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && (
                                        <p className={`mt-2 text-xs flex items-center gap-1 ${
                                            formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {formData.password === formData.confirmPassword ? (
                                                <><Check className="h-3 w-3" /> Las contraseñas coinciden</>
                                            ) : (
                                                <><X className="h-3 w-3" /> Las contraseñas no coinciden</>
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Phone - Solo en Register */}
                            {form_type === 'register' && (
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Teléfono <span className="text-gray-500 font-normal">(Opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                            placeholder="+34 600 000 000"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    form_type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
                                )}
                            </button>
                        </form>

                        {/* Footer Links */}
                        {form_type === 'login' && (
                            <div className="mt-6 text-center">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInForm;
