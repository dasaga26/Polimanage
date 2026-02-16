// ============================================================
// SIGN IN FORM - Formulario de Login/Register
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import type { LoginCredentials, RegisterData } from '../../types/authTypes';

interface LoginFormProps {
    form_type: 'login';
    sendData: (data: LoginCredentials) => void;
    errorMSG: string | null;
}

interface RegisterFormProps {
    form_type: 'register';
    sendData: (data: RegisterData) => void;
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Validación de longitud de contraseña
        if (formData.password.length < 6) {
            setValidationError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Validación específica de register
        if (form_type === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setValidationError('Las contraseñas no coinciden');
                return;
            }
            if (!formData.fullName.trim()) {
                setValidationError('El nombre completo es obligatorio');
                return;
            }
        }

        if (form_type === 'login') {
            sendData({
                email: formData.email,
                password: formData.password,
            } as LoginCredentials);
        } else {
            sendData({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone || undefined,
            } as RegisterData);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Back to Home Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver al inicio</span>
                </button>

                {/* Header */}
                <div>
                    <div className="flex justify-center mb-4">
                        <Home className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {form_type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {form_type === 'login' ? (
                            <>
                                ¿No tienes cuenta?{' '}
                                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Regístrate aquí
                                </Link>
                            </>
                        ) : (
                            <>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Inicia sesión
                                </Link>
                            </>
                        )}
                    </p>
                </div>

                {/* Error Message */}
                {(errorMSG || validationError) && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                        <p className="text-sm">{validationError || errorMSG}</p>
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Full Name - Solo en Register */}
                        {form_type === 'register' && (
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Nombre Completo
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Juan Pérez"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña {form_type === 'register' && '(mínimo 6 caracteres)'}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Confirm Password - Solo en Register */}
                        {form_type === 'register' && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {/* Phone - Solo en Register */}
                        {form_type === 'register' && (
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Teléfono (Opcional)
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="+34 600 000 000"
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            {form_type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </button>
                    </div>
                </form>

                {/* Footer Links */}
                {form_type === 'login' && (
                    <div className="text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignInForm;
