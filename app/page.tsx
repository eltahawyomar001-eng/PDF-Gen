import { prisma } from '@/lib/prisma';
import PdfGeneratorForm from '@/components/PdfGeneratorForm';
import Link from 'next/link';

export default async function Home() {
  // Server-side fetch companies and templates
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
    },
  });

  const templates = await prisma.pdfTemplate.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="w-full max-w-2xl px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                PDF Generator
              </h1>
              <p className="text-gray-600 mb-8">
                Wählen Sie eine Firma und eine PDF-Vorlage aus
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/companies"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Firmen →
              </Link>
              <Link
                href="/admin/templates"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Vorlagen →
              </Link>
            </div>
          </div>

          <PdfGeneratorForm companies={companies} templates={templates} />
        </div>
      </main>
    </div>
  );
}
