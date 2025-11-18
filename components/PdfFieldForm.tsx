'use client';

import { useState, useEffect } from 'react';
import { createPdfField, updatePdfField, deletePdfField } from '@/app/actions/pdfFields';

const VALID_FIELD_KEYS = [
  'name',
  'street',
  'postalCode',
  'city',
  'country',
  'taxId',
  'iban',
  'email',
  'phone',
  'fax',
  'contactPerson',
  'hrNr',
  'registergericht',
  'bimaNummer',
] as const;

type FieldData = {
  fieldKey: typeof VALID_FIELD_KEYS[number];
  label: string;
  page: number;
  x: number;
  y: number;
  fontSize: number;
  maxWidth: number | null;
  align: 'left' | 'center' | 'right';
};

type PdfFieldFormProps = {
  templateId: number;
  field?: {
    id: number;
    fieldKey: string;
    label: string;
    page: number;
    x: number;
    y: number;
    fontSize: number;
    maxWidth: number | null;
    align: string;
  };
  capturedCoordinates?: { x: number; y: number } | null;
  onCoordinatesUsed?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function PdfFieldForm({ 
  templateId, 
  field, 
  capturedCoordinates,
  onCoordinatesUsed,
  onSuccess, 
  onCancel 
}: PdfFieldFormProps) {
  const isEdit = !!field;
  
  const [formData, setFormData] = useState<FieldData>({
    fieldKey: (field?.fieldKey as any) || ('name' as const),
    label: field?.label || '',
    page: field?.page ?? 0,
    x: field?.x ?? capturedCoordinates?.x ?? 100,
    y: field?.y ?? capturedCoordinates?.y ?? 700,
    fontSize: field?.fontSize ?? 12,
    maxWidth: field?.maxWidth ?? null,
    align: (field?.align as 'left' | 'center' | 'right') || 'left',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Update coordinates when captured coordinates change
  useEffect(() => {
    if (capturedCoordinates && !isEdit) {
      setFormData(prev => ({
        ...prev,
        x: capturedCoordinates.x,
        y: capturedCoordinates.y,
      }));
      // Notify parent that coordinates have been used
      if (onCoordinatesUsed) {
        onCoordinatesUsed();
      }
    }
  }, [capturedCoordinates, isEdit, onCoordinatesUsed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const result = isEdit
        ? await updatePdfField(field.id, formData as any)
        : await createPdfField(templateId, formData as any);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
        // Reset form if creating new field
        if (!isEdit) {
          setFormData({
            fieldKey: 'name' as const,
            label: '',
            page: 0,
            x: 100,
            y: 700,
            fontSize: 12,
            maxWidth: null,
            align: 'left',
          });
        }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field Key */}
        <div>
          <label htmlFor="fieldKey" className="block text-sm font-medium text-gray-700 mb-1">
            Feldschlüssel *
          </label>
          <select
            id="fieldKey"
            value={formData.fieldKey}
            onChange={(e) => setFormData({ ...formData, fieldKey: e.target.value as any })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              getFieldError('fieldKey') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            required
          >
            <option value="">-- Bitte wählen --</option>
            {VALID_FIELD_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          {getFieldError('fieldKey') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('fieldKey')}</p>
          )}
        </div>

        {/* Label */}
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            Label (Deutsch) *
          </label>
          <input
            type="text"
            id="label"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              getFieldError('label') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="z.B. Firmenname"
            disabled={isSubmitting}
            required
          />
          {getFieldError('label') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('label')}</p>
          )}
        </div>

        {/* Page */}
        <div>
          <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-1">
            Seite *
          </label>
          <input
            type="number"
            id="page"
            value={formData.page}
            onChange={(e) => setFormData({ ...formData, page: parseInt(e.target.value) || 0 })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              getFieldError('page') ? 'border-red-500' : 'border-gray-300'
            }`}
            min="0"
            disabled={isSubmitting}
            required
          />
          {getFieldError('page') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('page')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">0-basiert (erste Seite = 0)</p>
        </div>

        {/* Font Size */}
        <div>
          <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-1">
            Schriftgröße (pt) *
          </label>
          <input
            type="number"
            id="fontSize"
            value={formData.fontSize}
            onChange={(e) => setFormData({ ...formData, fontSize: parseFloat(e.target.value) || 12 })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              getFieldError('fontSize') ? 'border-red-500' : 'border-gray-300'
            }`}
            min="1"
            max="100"
            step="0.5"
            disabled={isSubmitting}
            required
          />
          {getFieldError('fontSize') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('fontSize')}</p>
          )}
        </div>

        {/* X Position */}
        <div>
          <label htmlFor="x" className="block text-sm font-medium text-gray-700 mb-1">
            X-Position *
          </label>
          <input
            type="number"
            id="x"
            value={formData.x}
            onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              getFieldError('x') ? 'border-red-500' : 'border-gray-300'
            }`}
            min="0"
            step="0.1"
            disabled={isSubmitting}
            required
          />
          {getFieldError('x') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('x')}</p>
          )}
        </div>

        {/* Y Position */}
        <div>
          <label htmlFor="y" className="block text-sm font-medium text-gray-700 mb-1">
            Y-Position *
          </label>
          <input
            type="number"
            id="y"
            value={formData.y}
            onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              getFieldError('y') ? 'border-red-500' : 'border-gray-300'
            }`}
            min="0"
            step="0.1"
            disabled={isSubmitting}
            required
          />
          {getFieldError('y') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('y')}</p>
          )}
        </div>

        {/* Max Width */}
        <div>
          <label htmlFor="maxWidth" className="block text-sm font-medium text-gray-700 mb-1">
            Max. Breite (optional)
          </label>
          <input
            type="number"
            id="maxWidth"
            value={formData.maxWidth ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, maxWidth: e.target.value ? parseFloat(e.target.value) : null })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.1"
            disabled={isSubmitting}
            placeholder="Keine Begrenzung"
          />
        </div>

        {/* Alignment */}
        <div>
          <label htmlFor="align" className="block text-sm font-medium text-gray-700 mb-1">
            Ausrichtung *
          </label>
          <select
            id="align"
            value={formData.align}
            onChange={(e) => setFormData({ ...formData, align: e.target.value as 'left' | 'center' | 'right' })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              getFieldError('align') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            required
          >
            <option value="left">Links</option>
            <option value="center">Zentriert</option>
            <option value="right">Rechts</option>
          </select>
          {getFieldError('align') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('align')}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Speichern...' : isEdit ? 'Aktualisieren' : 'Feld hinzufügen'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}

// Field Row Component with Edit/Delete
type FieldRowProps = {
  field: {
    id: number;
    fieldKey: string;
    label: string;
    page: number;
    x: number;
    y: number;
    fontSize: number;
    maxWidth: number | null;
    align: string;
  };
  templateId: number;
};

export function PdfFieldRow({ field, templateId }: FieldRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Möchten Sie das Feld "${field.label}" wirklich löschen?`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deletePdfField(field.id);
    
    if (!result.success) {
      alert(result.error || 'Fehler beim Löschen');
      setIsDeleting(false);
    }
    // No need to set isDeleting false on success, page will revalidate
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td colSpan={7} className="px-4 py-4">
          <div className="max-w-4xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Feld bearbeiten</h4>
            <PdfFieldForm
              templateId={templateId}
              field={field}
              onSuccess={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-600">
        {field.fieldKey}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{field.label}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{field.page}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
        ({field.x}, {field.y})
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        <div>
          <span className="font-medium">{field.fontSize}pt</span>
          {field.maxWidth && (
            <span className="text-xs text-gray-400 ml-1">max: {field.maxWidth}px</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            field.align === 'left'
              ? 'bg-green-100 text-green-800'
              : field.align === 'center'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          {field.align}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Bearbeiten
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          {isDeleting ? 'Löschen...' : 'Löschen'}
        </button>
      </td>
    </tr>
  );
}
