'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(100, 'Name ist zu lang'),
  description: z.string().optional(),
  fileName: z.string().min(1, 'Dateiname ist erforderlich'),
  ownerId: z.number().int().positive().optional().nullable(),
});

type ActionResult = {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  templateId?: number;
};

export async function createTemplate(data: z.infer<typeof templateSchema>): Promise<ActionResult> {
  try {
    const validatedData = templateSchema.parse(data);

    const template = await prisma.pdfTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        fileName: validatedData.fileName,
        ownerId: validatedData.ownerId || null,
      },
    });

    revalidatePath('/admin/templates');
    
    return {
      success: true,
      templateId: template.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    return {
      success: false,
      error: 'Fehler beim Erstellen der Vorlage',
    };
  }
}

export async function updateTemplate(
  id: number,
  data: z.infer<typeof templateSchema>
): Promise<ActionResult> {
  try {
    const validatedData = templateSchema.parse(data);

    await prisma.pdfTemplate.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        fileName: validatedData.fileName,
        ownerId: validatedData.ownerId || null,
      },
    });

    revalidatePath('/admin/templates');
    revalidatePath(`/admin/templates/${id}`);
    
    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    return {
      success: false,
      error: 'Fehler beim Aktualisieren der Vorlage',
    };
  }
}

export async function deleteTemplate(id: number): Promise<ActionResult> {
  try {
    await prisma.pdfTemplate.delete({
      where: { id },
    });

    revalidatePath('/admin/templates');
    
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Fehler beim Löschen der Vorlage',
    };
  }
}
