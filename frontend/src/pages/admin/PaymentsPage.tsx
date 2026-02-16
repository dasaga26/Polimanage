import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { PaymentsManager } from '@/components/admin/payments/PaymentsManager';

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <PaymentsManager />
    </DashboardLayout>
  );
}
