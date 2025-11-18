import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CompaniesAdminPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { templates: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
            >
              ← Zurück zur Startseite
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Firmenverwaltung
            </h1>
            <p className="text-gray-600 mt-2">
              Verwalten Sie Ihre Firmendaten
            </p>
          </div>
          <Link
            href="/admin/companies/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Neue Firma hinzufügen
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Gesamt Firmen</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{companies.length}</div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Alle Firmen</h2>
          </div>
          {companies.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 mb-4">Keine Firmen vorhanden.</p>
              <Link
                href="/admin/companies/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Erste Firma hinzufügen
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Firma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Adresse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kontakt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      USt-IdNr
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        {company.hrNr && (
                          <div className="text-sm text-gray-500">
                            HR-Nr: {company.hrNr}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{company.street}</div>
                        <div className="text-sm text-gray-500">
                          {company.postalCode} {company.city}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {company.email && (
                          <div className="text-sm text-gray-900">{company.email}</div>
                        )}
                        {company.phone && (
                          <div className="text-sm text-gray-500">{company.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {company.taxId || '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/companies/${company.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Bearbeiten
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
