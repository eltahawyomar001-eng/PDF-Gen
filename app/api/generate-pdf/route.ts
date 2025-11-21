import { NextResponse } from 'next/server';
import { loadPdfTemplate } from '@/lib/pdfLoader';
import { PDFDocument } from 'pdf-lib';
import { prisma } from '@/lib/prisma';

/**
 * Server-only API route: Generate a filled PDF from a template
 * POST /api/generate-pdf
 * 
 * Body: {
 *   companyId: number,
 *   templateId: number
 * }
 * 
 * Returns a PDF with company data filled into the template form fields
 */

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { companyId, templateId } = body;

    // Validate required fields
    if (!companyId || typeof companyId !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid companyId (must be a number)' },
        { status: 400 }
      );
    }

    if (!templateId || typeof templateId !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid templateId (must be a number)' },
        { status: 400 }
      );
    }

    console.log(`Generating PDF for company ${companyId} with template ${templateId}`);

    // Fetch the company data
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { 
          error: 'Company not found',
          companyId 
        },
        { status: 404 }
      );
    }

    console.log(`Found company: ${company.name}`);

    // Fetch the template from the database
    const template = await prisma.pdfTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { 
          error: 'PDF template not found',
          templateId 
        },
        { status: 404 }
      );
    }

    console.log(`Found template: ${template.name}`);

    // Fetch the PDF field mappings for this template
    const fieldMappings = await prisma.pdfField.findMany({
      where: { templateId: templateId },
    });

    console.log(`Found ${fieldMappings.length} field mappings for template`);

    // Load the PDF template from filesystem
    const pdfBytes = await loadPdfTemplate(template.fileName);
    console.log(`Loaded PDF template: ${template.fileName} (${pdfBytes.length} bytes)`);

    // Load the PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    console.log(`PDF has ${pages.length} pages`);

    // Use the dynamic field mappings to draw text on the PDF
    let fieldsFilledCount = 0;

    for (const fieldMapping of fieldMappings) {
      try {
        // Get the value from the company object based on fieldKey
        const value = company[fieldMapping.fieldKey as keyof typeof company];
        const valueToFill = value ? String(value) : '';
        
        if (valueToFill && fieldMapping.page < pages.length) {
          const page = pages[fieldMapping.page];
          const { height } = page.getSize();
          
          // Draw text at the specified coordinates
          page.drawText(valueToFill, {
            x: fieldMapping.x,
            y: height - fieldMapping.y, // PDF coords are bottom-up
            size: fieldMapping.fontSize,
            maxWidth: fieldMapping.maxWidth || undefined,
          });
          
          console.log(`✓ Filled ${fieldMapping.fieldKey} at (${fieldMapping.x}, ${fieldMapping.y})`);
          fieldsFilledCount++;
        }
      } catch (e) {
        console.log(`⚠ Could not fill field ${fieldMapping.fieldKey}:`, e);
      }
    }

    console.log(`Successfully filled ${fieldsFilledCount} fields using coordinate mappings`);

    // Save the modified PDF
    const filledPdfBytes = await pdfDoc.save();
    console.log(`Generated PDF: ${filledPdfBytes.length} bytes`);

    // Generate a meaningful filename
    const sanitizedCompanyName = company.name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedCompanyName}_${template.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;

    // Return the PDF as a buffer
    return new NextResponse(Buffer.from(filledPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': filledPdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
