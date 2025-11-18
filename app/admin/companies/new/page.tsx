import CompanyForm from '@/components/CompanyForm';
import Link from 'next/link';

export default function NewCompanyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Neue Firma hinzufügen</h1>
          <p className="text-gray-600 mt-2">
            Erstellen Sie eine neue Firma für die PDF-Generierung.
          </p>
        </div>

        <CompanyForm />
      </div>
    </div>
  );
}
