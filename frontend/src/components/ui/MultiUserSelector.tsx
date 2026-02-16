import { useState } from 'react';
import { Check, X, Search, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { User } from '@/services/userService';

interface MultiUserSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    availableUsers: User[];
    onAddUsers: (userSlugs: string[]) => Promise<void>;
    title?: string;
    description?: string;
    isPending?: boolean;
    maxSelection?: number; // Límite máximo de usuarios que se pueden seleccionar
}

export function MultiUserSelector({
    isOpen,
    onClose,
    availableUsers,
    onAddUsers,
    title = 'Añadir Usuarios',
    description,
    isPending = false,
    maxSelection,
}: MultiUserSelectorProps) {
    const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = availableUsers.filter(
        (user) =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canSelectMore = !maxSelection || selectedSlugs.size < maxSelection;
    const remainingSelections = maxSelection ? maxSelection - selectedSlugs.size : undefined;

    const toggleUser = (slug: string) => {
        const newSelected = new Set(selectedSlugs);
        if (newSelected.has(slug)) {
            newSelected.delete(slug);
        } else {
            // Solo permitir agregar si no se ha alcanzado el máximo
            if (canSelectMore) {
                newSelected.add(slug);
            }
        }
        setSelectedSlugs(newSelected);
    };

    const toggleAll = () => {
        if (selectedSlugs.size === filteredUsers.length) {
            setSelectedSlugs(new Set());
        } else {
            // Respetar el límite máximo al seleccionar todos
            const usersToSelect = maxSelection 
                ? filteredUsers.slice(0, maxSelection)
                : filteredUsers;
            setSelectedSlugs(new Set(usersToSelect.map((u) => u.slug)));
        }
    };

    const handleSubmit = async () => {
        if (selectedSlugs.size === 0) return;

        await onAddUsers(Array.from(selectedSlugs));
        setSelectedSlugs(new Set());
        setSearchTerm('');
    };

    const handleClose = () => {
        setSelectedSlugs(new Set());
        setSearchTerm('');
        onClose();
    };

    const allSelected = filteredUsers.length > 0 && selectedSlugs.size === filteredUsers.length;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Selection Info */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="select-all"
                                checked={allSelected}
                                onCheckedChange={toggleAll}
                                disabled={maxSelection !== undefined && maxSelection === 0}
                            />
                            <label
                                htmlFor="select-all"
                                className="text-sm font-medium cursor-pointer"
                            >
                                Seleccionar todos ({filteredUsers.length})
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-blue-600">
                                    {selectedSlugs.size} seleccionados
                                </span>
                            </div>
                            {maxSelection !== undefined && (
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                    remainingSelections === 0 
                                        ? 'bg-red-100 text-red-700 font-semibold' 
                                        : remainingSelections! <= 3 
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                }`}>
                                    {remainingSelections === 0 
                                        ? 'Límite alcanzado' 
                                        : `${remainingSelections} ${remainingSelections === 1 ? 'espacio' : 'espacios'}`}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>
                                    {searchTerm
                                        ? 'No se encontraron usuarios con ese criterio'
                                        : 'No hay usuarios disponibles para añadir'}
                                </p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedSlugs.has(user.slug);
                                const isDisabled = !isSelected && !canSelectMore;
                                
                                return (
                                    <div
                                        key={user.slug}
                                        onClick={() => !isDisabled && toggleUser(user.slug)}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                            isDisabled
                                                ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                                : isSelected
                                                ? 'bg-blue-50 border border-blue-200 cursor-pointer'
                                                : 'bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer hover:shadow-sm'
                                        }`}
                                    >
                                        <Checkbox 
                                            checked={isSelected} 
                                            onCheckedChange={() => !isDisabled && toggleUser(user.slug)}
                                            disabled={isDisabled}
                                        />

                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate">{user.fullName}</div>
                                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                        </div>

                                        {isSelected && (
                                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={handleClose} disabled={isPending}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedSlugs.size === 0 || isPending}
                        className="flex-1 sm:flex-initial"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isPending
                            ? 'Añadiendo...'
                            : `Añadir ${selectedSlugs.size} ${selectedSlugs.size === 1 ? 'usuario' : 'usuarios'}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
