'use client';

import { useState } from 'react';

type Company = {
  id: number;
  name: string;
};

type Template = {
  id: number;
  name: string;
  description: string | null;
};

type Props = {
  companies: Company[];
  templates: Template[];
};

export default function PdfGeneratorForm({ companies, templates }: Props) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    // Reset messages
    setError(null);
    setSuccess(null);

    // Validate selections
    if (!selectedCompanyId || !selectedTemplateId) {
      setError('Bitte wählen Sie sowohl eine Firma als auch eine PDF-Vorlage aus.');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          templateId: selectedTemplateId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Generieren des PDFs');
      }

      // Get the PDF as a blob
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Create filename from company and template names
      const company = companies.find((c) => c.id === selectedCompanyId);
      const template = templates.find((t) => t.id === selectedTemplateId);
      const companyName = company?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'firma';
      const templateName = template?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'vorlage';
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `${companyName}_${templateName}_${timestamp}.pdf`;

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess('PDF erfolgreich generiert und heruntergeladen!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
          Firma auswählen
        </label>
        <select
          id="company"
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          disabled={isLoading}
        >
          <option value="">-- Bitte wählen --</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Template Selection */}
      <div>
        <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
          PDF-Vorlage auswählen
        </label>
        <select
          id="template"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          disabled={isLoading}
        >
          <option value="">-- Bitte wählen --</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
              {template.description && ` - ${template.description}`}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Fehler:</span> {error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Erfolg:</span> {success}
          </p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGeneratePdf}
        disabled={isLoading || !selectedCompanyId || !selectedTemplateId}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            PDF wird generiert...
          </span>
        ) : (
          'PDF erzeugen'
        )}
      </button>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Hinweis:</span> Das PDF wird automatisch mit den
          Firmendaten aus der Datenbank gefüllt und heruntergeladen.
        </p>
      </div>
    </div>
  );
}
