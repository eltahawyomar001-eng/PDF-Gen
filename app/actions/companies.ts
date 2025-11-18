'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Zod schema for company validation
const companySchema = z.object({
  name: z.string().min(1, 'Firmenname darf nicht leer sein').max(200, 'Firmenname ist zu lang'),
  street: z.string().min(1, 'Straße darf nicht leer sein').max(200, 'Straße ist zu lang'),
  postalCode: z.string().min(1, 'PLZ darf nicht leer sein').max(10, 'PLZ ist zu lang'),
  city: z.string().min(1, 'Stadt darf nicht leer sein').max(100, 'Stadt ist zu lang'),
  country: z.string().min(1, 'Land darf nicht leer sein').max(100, 'Land ist zu lang'),
  taxId: z.string().max(50, 'USt-IdNr ist zu lang').optional().nullable(),
  iban: z.string().max(34, 'IBAN ist zu lang').optional().nullable(),
  contactPerson: z.string().max(100, 'Ansprechpartner ist zu lang').optional().nullable(),
  email: z.string().email('Ungültige E-Mail-Adresse').max(100, 'E-Mail ist zu lang').optional().nullable(),
  phone: z.string().max(30, 'Telefonnummer ist zu lang').optional().nullable(),
  fax: z.string().max(30, 'Faxnummer ist zu lang').optional().nullable(),
  hrNr: z.string().max(50, 'HR-Nr ist zu lang').optional().nullable(),
  registergericht: z.string().max(100, 'Registergericht ist zu lang').optional().nullable(),
  bimaNummer: z.string().max(50, 'BIMA-Nummer ist zu lang').optional().nullable(),
});

type CompanyFormData = z.infer<typeof companySchema>;

/**
 * Create a new company
 */
export async function createCompany(data: CompanyFormData) {
  try {
    // Validate input
    const validatedData = companySchema.parse(data);

    // Create company
    const company = await prisma.company.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        fax: validatedData.fax || null,
        taxId: validatedData.taxId || null,
        iban: validatedData.iban || null,
        contactPerson: validatedData.contactPerson || null,
        hrNr: validatedData.hrNr || null,
        registergericht: validatedData.registergericht || null,
        bimaNummer: validatedData.bimaNummer || null,
      },
    });

    // Revalidate the companies pages
    revalidatePath('/');
    revalidatePath('/admin/companies');

    return {
      success: true,
      company,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validierungsfehler',
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error('Error creating company:', error);
    return {
      success: false,
      error: 'Fehler beim Erstellen der Firma',
    };
  }
}

/**
 * Update an existing company
 */
export async function updateCompany(id: number, data: CompanyFormData) {
  try {
    // Validate input
    const validatedData = companySchema.parse(data);

    // Update company
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        fax: validatedData.fax || null,
        taxId: validatedData.taxId || null,
        iban: validatedData.iban || null,
        contactPerson: validatedData.contactPerson || null,
        hrNr: validatedData.hrNr || null,
        registergericht: validatedData.registergericht || null,
        bimaNummer: validatedData.bimaNummer || null,
      },
    });

    // Revalidate the companies pages
    revalidatePath('/');
    revalidatePath('/admin/companies');
    revalidatePath(`/admin/companies/${id}`);

    return {
      success: true,
      company,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validierungsfehler',
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error('Error updating company:', error);
    return {
      success: false,
      error: 'Fehler beim Aktualisieren der Firma',
    };
  }
}

/**
 * Delete a company
 */
export async function deleteCompany(id: number) {
  try {
    await prisma.company.delete({
      where: { id },
    });

    // Revalidate the companies pages
    revalidatePath('/');
    revalidatePath('/admin/companies');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting company:', error);
    return {
      success: false,
      error: 'Fehler beim Löschen der Firma',
    };
  }
}
