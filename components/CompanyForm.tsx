'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCompany, updateCompany, deleteCompany } from '@/app/actions/companies';

type CompanyFormProps = {
  company?: {
    id: number;
    name: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    taxId: string | null;
    iban: string | null;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    fax: string | null;
    hrNr: string | null;
    registergericht: string | null;
    bimaNummer: string | null;
  };
  isEdit?: boolean;
};

export default function CompanyForm({ company, isEdit = false }: CompanyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: company?.name || '',
    street: company?.street || '',
    postalCode: company?.postalCode || '',
    city: company?.city || '',
    country: company?.country || 'Deutschland',
    taxId: company?.taxId || '',
    iban: company?.iban || '',
    contactPerson: company?.contactPerson || '',
    email: company?.email || '',
    phone: company?.phone || '',
    fax: company?.fax || '',
    hrNr: company?.hrNr || '',
    registergericht: company?.registergericht || '',
    bimaNummer: company?.bimaNummer || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const data = {
      ...formData,
      taxId: formData.taxId || null,
      iban: formData.iban || null,
      contactPerson: formData.contactPerson || null,
      email: formData.email || null,
      phone: formData.phone || null,
      fax: formData.fax || null,
      hrNr: formData.hrNr || null,
      registergericht: formData.registergericht || null,
      bimaNummer: formData.bimaNummer || null,
    };

    const result = isEdit && company
      ? await updateCompany(company.id, data as any)
      : await createCompany(data as any);

    if (result.success) {
      router.push('/admin/companies');
      router.refresh();
    } else {
      setError(result.error || 'Ein Fehler ist aufgetreten');
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!company) return;
    
    setIsSubmitting(true);
    const result = await deleteCompany(company.id);
    
    if (result.success) {
      router.push('/admin/companies');
      router.refresh();
    } else {
      setError(result.error || 'Fehler beim Löschen');
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getFieldError = (field: string) => {
    return fieldErrors[field]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grundinformationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Firmenname *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                getFieldError('name') ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            />
            {getFieldError('name') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('name')}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Straße *
            </label>
            <input
              type="text"
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                getFieldError('street') ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            />
            {getFieldError('street') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('street')}</p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              PLZ *
            </label>
            <input
              type="text"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                getFieldError('postalCode') ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            />
            {getFieldError('postalCode') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('postalCode')}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Stadt *
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                getFieldError('city') ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            />
            {getFieldError('city') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('city')}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Land *
            </label>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                getFieldError('country') ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            />
            {getFieldError('country') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('country')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontaktinformationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
              Ansprechpartner
            </label>
            <input
              type="text"
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                getFieldError('email') ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {getFieldError('email') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('email')}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="fax" className="block text-sm font-medium text-gray-700 mb-1">
              Fax
            </label>
            <input
              type="tel"
              id="fax"
              value={formData.fax}
              onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Geschäftsinformationen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
              USt-IdNr
            </label>
            <input
              type="text"
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="hrNr" className="block text-sm font-medium text-gray-700 mb-1">
              HR-Nr
            </label>
            <input
              type="text"
              id="hrNr"
              value={formData.hrNr}
              onChange={(e) => setFormData({ ...formData, hrNr: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="registergericht" className="block text-sm font-medium text-gray-700 mb-1">
              Registergericht
            </label>
            <input
              type="text"
              id="registergericht"
              value={formData.registergericht}
              onChange={(e) => setFormData({ ...formData, registergericht: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="bimaNummer" className="block text-sm font-medium text-gray-700 mb-1">
              BIMA-Nummer
            </label>
            <input
              type="text"
              id="bimaNummer"
              value={formData.bimaNummer}
              onChange={(e) => setFormData({ ...formData, bimaNummer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-1">
              IBAN
            </label>
            <input
              type="text"
              id="iban"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Firma löschen
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wird gespeichert...' : (isEdit ? 'Speichern' : 'Erstellen')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Firma löschen?
            </h3>
            <p className="text-gray-600 mb-4">
              Sind Sie sicher, dass Sie diese Firma löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wird gelöscht...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
