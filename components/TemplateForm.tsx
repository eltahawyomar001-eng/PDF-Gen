'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTemplate, updateTemplate } from '@/app/actions/templates';

type TemplateFormProps = {
  template?: {
    id: number;
    name: string;
    description: string | null;
    fileName: string;
    ownerId: number | null;
  };
};

export default function TemplateForm({ template }: TemplateFormProps) {
  const router = useRouter();
  const isEdit = !!template;

  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    fileName: template?.fileName || '',
    ownerId: template?.ownerId || null,
  });

  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Fetch available PDF files and companies
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch companies
        const companiesRes = await fetch('/api/companies');
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(companiesData);
        }

        // Fetch available PDF files
        await fetchPdfFiles();
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }
    fetchData();
  }, []);

  const fetchPdfFiles = async () => {
    try {
      const filesRes = await fetch('/api/pdf-files');
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setAvailableFiles(filesData.files || []);
      }
    } catch (err) {
      console.error('Error fetching PDF files:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the file list
        await fetchPdfFiles();
        // Set the uploaded file as selected
        setFormData(prev => ({ ...prev, fileName: data.fileName }));
        setUploadError(null);
      } else {
        setUploadError(data.error || 'Upload fehlgeschlagen');
      }
    } catch (err) {
      setUploadError('Fehler beim Hochladen der Datei');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const result = isEdit
        ? await updateTemplate(template.id, formData)
        : await createTemplate(formData);

      if (result.success) {
        if (isEdit) {
          router.push(`/admin/templates/${template.id}`);
        } else if (result.templateId) {
          router.push(`/admin/templates/${result.templateId}`);
        } else {
          router.push('/admin/templates');
        }
        router.refresh();
      } else {
        setError(result.error || 'Ein Fehler ist aufgetreten');
        if (result.errors) {
          setFieldErrors(result.errors);
        }
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Vorlagenname *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        {getFieldError('name') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Beschreibung
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {getFieldError('description') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
        )}
      </div>

      {/* PDF File Selection */}
      <div>
        <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
          PDF-Datei *
        </label>
        
        {/* Upload Section */}
        <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="pdf-upload"
              />
              <span className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {isUploading ? 'Hochladen...' : 'Neue PDF hochladen'}
              </span>
            </label>
          </div>
          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Max. 10MB • Nur PDF-Dateien • Wird in Cloud-Speicher hochgeladen
          </p>
        </div>

        {/* File Selection Dropdown */}
        <select
          id="fileName"
          value={formData.fileName}
          onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">-- Datei auswählen --</option>
          {availableFiles.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
        {getFieldError('fileName') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('fileName')}</p>
        )}
      </div>

      {/* Owner (Company) */}
      <div>
        <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
          Eigentümer (Firma)
        </label>
        <select
          id="ownerId"
          value={formData.ownerId || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              ownerId: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Keine Firma --</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        {getFieldError('ownerId') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('ownerId')}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Speichert...' : isEdit ? 'Aktualisieren' : 'Erstellen'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
