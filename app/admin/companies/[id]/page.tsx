import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CompanyForm from '@/components/CompanyForm';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function EditCompanyPage({
  params,
}: {
  params: { id: string };
}) {
  // Skip database queries during build
  if (!process.env.DATABASE_URL) {
    return <div>Loading...</div>;
  }

  const companyId = parseInt(params.id);

  if (isNaN(companyId)) {
    notFound();
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            href="/admin/companies" 
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Zurück zur Übersicht
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Firma bearbeiten</h1>
          <p className="text-gray-600 mt-2">
            Bearbeiten Sie die Informationen für {company.name}.
          </p>
        </div>

        <CompanyForm company={company} isEdit />
      </div>
    </div>
  );
}
