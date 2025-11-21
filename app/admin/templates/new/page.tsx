import Link from 'next/link';
import TemplateForm from '@/components/TemplateForm';

export default function NewTemplatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/admin/templates"
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Zurück zur Vorlagenübersicht
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Neue PDF-Vorlage erstellen
          </h1>
          <TemplateForm />
        </div>
      </div>
    </div>
  );
}
