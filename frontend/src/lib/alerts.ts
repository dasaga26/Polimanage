import Swal from 'sweetalert2';

// Configuración base para las alertas
const baseConfig = {
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    // Aumentar z-index para que aparezca sobre otros modales
    customClass: {
        container: 'swal-overlay-high'
    }
};

// Añadir estilos globales para el z-index de SweetAlert (mayor que modales z-50)
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        .swal-overlay-high {
            z-index: 10000 !important;
        }
        .swal2-container {
            z-index: 99999 !important;
            pointer-events: all !important;
        }
        .swal2-overlay {
            z-index: 99998 !important;
        }
        .swal2-popup {
            z-index: 100000 !important;
            pointer-events: all !important;
        }
        .swal2-backdrop-show {
            z-index: 99997 !important;
            pointer-events: all !important;
        }
    `;
    document.head.appendChild(style);
}

export const showSuccess = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        ...baseConfig,
    });
};

export const showError = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'error',
        title,
        text: text || 'Ha ocurrido un error inesperado',
        ...baseConfig,
    });
};

export const showWarning = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        ...baseConfig,
    });
};

export const showInfo = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        ...baseConfig,
    });
};

export const showConfirm = async (title: string, text?: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        ...baseConfig,
    });

    return result.isConfirmed;
};

// Función para parsear errores del servidor
export const parseServerError = (error: any): string => {
    // Si el error tiene una respuesta del servidor
    if (error?.response?.data) {
        const data = error.response.data;

        // Si hay un mensaje específico
        if (data.message) return data.message;
        if (data.error) return data.error;

        // Si hay errores de validación
        if (data.errors && Array.isArray(data.errors)) {
            return data.errors.map((e: any) => e.message || e).join(', ');
        }
    }

    // Si el error tiene un mensaje directo
    if (error?.message) return error.message;

    // Mensaje por defecto
    return 'Ha ocurrido un error inesperado';
};

// Función para mostrar errores del servidor
export const showServerError = (error: any, defaultTitle = 'Error') => {
    const message = parseServerError(error);
    return showError(defaultTitle, message);
};

// Toast notification ligero (opcional, no bloquea la UI)
export const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    return Toast.fire({
        icon: type,
        title: message
    });
};
