import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FieldManagerWithPreview from '@/components/FieldManagerWithPreview';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TemplateDetailPage({ params }: PageProps) {
  // Skip database queries during build
  if (!process.env.DATABASE_URL) {
    return <div>Loading...</div>;
  }

  const { id } = await params;
  const templateId = parseInt(id, 10);

  if (isNaN(templateId)) {
    notFound();
  }

  // Fetch the template with its fields and owner
  const template = await prisma.pdfTemplate.findUnique({
    where: { id: templateId },
    include: {
      fields: {
        orderBy: [{ page: 'asc' }, { y: 'desc' }],
      },
      owner: {
        select: {
          id: true,
          name: true,
          street: true,
          city: true,
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/templates"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {template.name}
          </h1>
          {template.description && (
            <p className="text-gray-600">{template.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Template Info */}
          <div className="space-y-6">
            {/* Template Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vorlagen-Informationen
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{template.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dateiname</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {template.fileName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Eigentümer</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {template.owner ? (
                      <div>
                        <div className="font-medium">{template.owner.name}</div>
                        <div className="text-gray-500 text-xs">
                          {template.owner.street}, {template.owner.city}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Kein Eigentümer</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Erstellt am</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(template.createdAt).toLocaleString('de-DE')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Zuletzt aktualisiert
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(template.updatedAt).toLocaleString('de-DE')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column - Empty for layout balance */}
          <div></div>
        </div>

        {/* Field Manager with PDF Preview - Full Width */}
        <div className="mt-6">
          <FieldManagerWithPreview
            templateId={template.id}
            pdfFileName={template.fileName}
            existingFields={template.fields}
          />
        </div>
      </div>
    </div>
  );
}
