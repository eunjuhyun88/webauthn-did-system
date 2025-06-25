import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Zauri + AI Passport',
  description: '통합 AI 개인화 대시보드',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
