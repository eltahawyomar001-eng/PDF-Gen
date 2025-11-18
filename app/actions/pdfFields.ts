'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Valid Company field keys
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

// Zod schema for PDF field validation
const pdfFieldSchema = z.object({
  templateId: z.number().int().positive(),
  fieldKey: z.enum(VALID_FIELD_KEYS, {
    message: 'Ungültiger Feldschlüssel. Muss ein gültiges Firmenfeld sein.',
  }),
  label: z.string().min(1, 'Label darf nicht leer sein').max(100, 'Label ist zu lang'),
  page: z.number().int().min(0, 'Seitenzahl muss >= 0 sein'),
  x: z.number().min(0, 'X-Position muss >= 0 sein'),
  y: z.number().min(0, 'Y-Position muss >= 0 sein'),
  fontSize: z.number().min(1, 'Schriftgröße muss >= 1 sein').max(100, 'Schriftgröße ist zu groß'),
  maxWidth: z.number().min(0).nullable().optional(),
  align: z.enum(['left', 'center', 'right'], {
    message: 'Ausrichtung muss left, center oder right sein',
  }),
});

const updatePdfFieldSchema = pdfFieldSchema.extend({
  id: z.number().int().positive(),
});

type ActionResult = {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
};

/**
 * Create a new PDF field
 */
export async function createPdfField(
  templateId: number,
  data: z.infer<typeof pdfFieldSchema>
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = pdfFieldSchema.parse({ ...data, templateId });

    // Check if template exists
    const template = await prisma.pdfTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return {
        success: false,
        error: 'Vorlage nicht gefunden',
      };
    }

    // Check if field with same key already exists for this template
    const existingField = await prisma.pdfField.findFirst({
      where: {
        templateId,
        fieldKey: validatedData.fieldKey,
      },
    });

    if (existingField) {
      return {
        success: false,
        error: `Ein Feld mit dem Schlüssel "${validatedData.fieldKey}" existiert bereits für diese Vorlage`,
      };
    }

    // Create the field
    await prisma.pdfField.create({
      data: {
        templateId: validatedData.templateId,
        fieldKey: validatedData.fieldKey,
        label: validatedData.label,
        page: validatedData.page,
        x: validatedData.x,
        y: validatedData.y,
        fontSize: validatedData.fontSize,
        maxWidth: validatedData.maxWidth || null,
        align: validatedData.align,
      },
    });

    // Revalidate the page
    revalidatePath(`/admin/templates/${templateId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return {
        success: false,
        error: 'Validierungsfehler',
        errors,
      };
    }

    console.error('Error creating PDF field:', error);
    return {
      success: false,
      error: 'Fehler beim Erstellen des Feldes',
    };
  }
}

/**
 * Update an existing PDF field
 */
export async function updatePdfField(
  fieldId: number,
  data: Omit<z.infer<typeof pdfFieldSchema>, 'templateId'>
): Promise<ActionResult> {
  try {
    // Get the existing field to get templateId
    const existingField = await prisma.pdfField.findUnique({
      where: { id: fieldId },
    });

    if (!existingField) {
      return {
        success: false,
        error: 'Feld nicht gefunden',
      };
    }

    // Validate input
    const validatedData = updatePdfFieldSchema.parse({
      ...data,
      id: fieldId,
      templateId: existingField.templateId,
    });

    // Check if another field with same key exists (excluding current field)
    const duplicateField = await prisma.pdfField.findFirst({
      where: {
        templateId: existingField.templateId,
        fieldKey: validatedData.fieldKey,
        NOT: {
          id: fieldId,
        },
      },
    });

    if (duplicateField) {
      return {
        success: false,
        error: `Ein anderes Feld mit dem Schlüssel "${validatedData.fieldKey}" existiert bereits`,
      };
    }

    // Update the field
    await prisma.pdfField.update({
      where: { id: fieldId },
      data: {
        fieldKey: validatedData.fieldKey,
        label: validatedData.label,
        page: validatedData.page,
        x: validatedData.x,
        y: validatedData.y,
        fontSize: validatedData.fontSize,
        maxWidth: validatedData.maxWidth || null,
        align: validatedData.align,
      },
    });

    // Revalidate the page
    revalidatePath(`/admin/templates/${existingField.templateId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return {
        success: false,
        error: 'Validierungsfehler',
        errors,
      };
    }

    console.error('Error updating PDF field:', error);
    return {
      success: false,
      error: 'Fehler beim Aktualisieren des Feldes',
    };
  }
}

/**
 * Delete a PDF field
 */
export async function deletePdfField(fieldId: number): Promise<ActionResult> {
  try {
    // Get the field to get templateId for revalidation
    const field = await prisma.pdfField.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return {
        success: false,
        error: 'Feld nicht gefunden',
      };
    }

    // Delete the field
    await prisma.pdfField.delete({
      where: { id: fieldId },
    });

    // Revalidate the page
    revalidatePath(`/admin/templates/${field.templateId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting PDF field:', error);
    return {
      success: false,
      error: 'Fehler beim Löschen des Feldes',
    };
  }
}

/**
 * Get valid field keys for dropdowns
 */
export async function getValidFieldKeys() {
  return VALID_FIELD_KEYS;
}
