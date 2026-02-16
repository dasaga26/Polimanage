import type { Class } from '@/types/classTypes';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Trash2, Edit, Calendar, Clock } from 'lucide-react';
import { TableLoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDateRange } from '@/lib/dateUtils';

const getStatusBadge = (status?: string) => {
  return <StatusBadge status={status || 'UNKNOWN'} />;
};

interface ClassListTableProps {
  classes: Class[];
  isLoading: boolean;
  onManage: (classItem: Class) => void;
  onEdit: (classItem: Class) => void;
  onDelete: (slug: string) => void;
}

export function ClassListTable({
  classes,
  isLoading,
  onManage,
  onEdit,
  onDelete,
}: ClassListTableProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-6">
        <TableLoadingSkeleton rows={5} columns={7} />
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No hay clases programadas"
        description="Comienza creando tu primera clase haciendo clic en el botón 'Nueva Clase'"
        className="border rounded-lg py-16"
      />
    );
  }

  const formatTime = (isoString: string) => {
    return formatDateRange(isoString, isoString);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Pista</TableHead>
            <TableHead>Monitor</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Ocupación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((classItem, index) => (
            <TableRow 
              key={classItem.id}
              className="hover:bg-gray-50 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-medium">{classItem.title}</TableCell>
              <TableCell>{classItem.pistaName || 'N/A'}</TableCell>
              <TableCell>{classItem.instructorName || 'N/A'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="font-medium">{formatTime(classItem.startTime)}</div>
                    <div className="text-gray-500 text-xs">
                      hasta {formatTime(classItem.endTime)}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(classItem.status)}</TableCell>
              <TableCell>
                {(() => {
                  const enrolled = classItem.enrollments?.length || 0;
                  const capacity = classItem.maxCapacity || classItem.capacity || 0;
                  const percentage = (enrolled / capacity) * 100;
                  
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{enrolled} / {capacity}</span>
                        <span className={`text-xs ${
                          percentage >= 100 ? 'text-red-600' :
                          percentage >= 80 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            percentage >= 100 ? 'bg-red-500' :
                            percentage >= 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onManage(classItem)}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Gestionar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(classItem)}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(classItem.slug)}
                    className="hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
