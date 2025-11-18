'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PdfFieldForm from './PdfFieldForm';

// Dynamically import PDF preview to avoid SSR issues
const PdfClickablePreview = dynamic(() => import('./PdfClickablePreview'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Lade PDF-Vorschau...</div>
      </div>
    </div>
  ),
});

interface FieldManagerWithPreviewProps {
  templateId: number;
  pdfFileName: string;
  existingFields: any[];
}

export default function FieldManagerWithPreview({
  templateId,
  pdfFileName,
  existingFields,
}: FieldManagerWithPreviewProps) {
  const [capturedCoordinates, setCapturedCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleCoordinateClick = (x: number, y: number) => {
    setCapturedCoordinates({ x, y });
  };

  const handleCoordinatesUsed = () => {
    // Clear captured coordinates after they've been used
    setCapturedCoordinates(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Field Management */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Feldverwaltung
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({existingFields.length} Felder)
              </span>
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Existing Fields */}
            {existingFields.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Vorhandene Felder
                </h3>
                <div className="space-y-2">
                  {existingFields.map((field: any) => (
                    <PdfFieldForm
                      key={field.id}
                      templateId={templateId}
                      field={field}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add New Field Form with captured coordinates */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Neues Feld hinzufügen
              </h3>
              {capturedCoordinates && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✓ Koordinaten erfasst: X={capturedCoordinates.x}, Y=
                    {capturedCoordinates.y}
                  </p>
                </div>
              )}
              <PdfFieldForm
                templateId={templateId}
                capturedCoordinates={capturedCoordinates}
                onCoordinatesUsed={handleCoordinatesUsed}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - PDF Preview */}
      <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <PdfClickablePreview
          pdfUrl={`/pdf-templates/${pdfFileName}`}
          onCoordinateClick={handleCoordinateClick}
          displayWidth={600}
        />
      </div>
    </div>
  );
}
