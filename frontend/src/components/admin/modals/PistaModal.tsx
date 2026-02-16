import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import type { Pista, CreatePistaDTO, UpdatePistaDTO } from '../../../services/pistaService';

interface PistaModalProps {
  pista: Pista | null;
  onClose: () => void;
  onSubmit: (data: CreatePistaDTO | UpdatePistaDTO) => void;
}

export function PistaModal({ pista, onClose, onSubmit }: PistaModalProps) {
  const [formData, setFormData] = useState({
    nombre: pista?.nombre || '',
    tipo: pista?.tipo || 'FUTBOL',
    superficie: pista?.superficie || '',
    imageUrl: pista?.imageUrl || '',
    precioHoraBase: pista?.precioHoraBase || 0,
    esActiva: pista?.esActiva ?? true,
    estado: pista?.estado || 'DISPONIBLE',
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede ser mayor a 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, imageUrl: base64String });
        setUploading(false);
      };
      reader.onerror = () => {
        alert('Error al leer el archivo');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir camelCase a snake_case para el backend
    const dataToSend = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      superficie: formData.superficie || null,
      image_url: formData.imageUrl || null,
      precio_hora_base: formData.precioHoraBase,
      ...(pista && {
        es_activa: formData.esActiva,
        estado: formData.estado,
      }),
    };
    onSubmit(dataToSend as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {pista ? 'Editar Pista' : 'Nueva Pista'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="FUTBOL">Fútbol</option>
              <option value="TENIS">Tenis</option>
              <option value="BALONCESTO">Baloncesto</option>
              <option value="PADEL">Pádel</option>
              <option value="POLIDEPORTIVA">Polideportiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Superficie</label>
            <input
              type="text"
              value={formData.superficie}
              onChange={(e) => setFormData({ ...formData, superficie: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ej: Césped artificial, Cemento, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Imagen de la Pista</label>

            {/* Preview de la imagen actual */}
            {formData.imageUrl && (
              <div className="mb-3 relative">
                <img
                  src={formData.imageUrl}
                  alt="Vista previa"
                  className="w-full h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Imagen+no+disponible';
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg"
                  title="Eliminar imagen"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Botones de carga */}
            <div className="space-y-2">
              {/* Upload desde archivo */}
              <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Cargando imagen...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-sm font-medium">
                      {formData.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {/* Opción de URL manual */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  O pega una URL de imagen
                </summary>
                <input
                  type="url"
                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mt-2"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </details>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Precio Base (€)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.precioHoraBase}
              onChange={(e) => setFormData({ ...formData, precioHoraBase: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          {pista && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                  <option value="INACTIVA">Inactiva</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="esActiva"
                  checked={formData.esActiva}
                  onChange={(e) => setFormData({ ...formData, esActiva: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="esActiva" className="text-sm font-medium">
                  Pista activa
                </label>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {pista ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
