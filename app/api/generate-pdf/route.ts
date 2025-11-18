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

    // Load the PDF template from filesystem
    const pdfBytes = await loadPdfTemplate(template.fileName);
    console.log(`Loaded PDF template: ${template.fileName} (${pdfBytes.length} bytes)`);

    // Load the PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    console.log(`PDF has ${form.getFields().length} form fields`);

    // Fill the actual PDF form fields with company data
    let fieldsFilledCount = 0;

    // Company address (multiline field)
    try {
      const addressField = form.getTextField('EVM_B_ANG_ANGEBOTS_BIETERANSCHRIFT');
      const addressText = `${company.name}\n${company.street}\n${company.postalCode} ${company.city}\n${company.country}`;
      addressField.setText(addressText);
      console.log('✓ Filled EVM_B_ANG_ANGEBOTS_BIETERANSCHRIFT');
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill address field');
    }

    // Location/City
    try {
      const ortField = form.getTextField('BIETER_ORT');
      ortField.setText(company.city || '');
      console.log('✓ Filled BIETER_ORT');
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill ORT field');
    }

    // Telephone
    try {
      const telField = form.getTextField('BIETER_TEL');
      telField.setText(company.phone || '');
      console.log('✓ Filled BIETER_TEL');
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill TEL field');
    }

    // Fax
    try {
      const faxField = form.getTextField('BIETER_FAX');
      faxField.setText(company.fax || '');
      console.log('✓ Filled BIETER_FAX');
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill FAX field');
    }

    // Email
    try {
      const emailField = form.getTextField('BIETER_EMAIL');
      emailField.setText(company.email || '');
      console.log('✓ Filled BIETER_EMAIL');
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill EMAIL field');
    }

    // Tax ID (USt-IdNr)
    try {
      const ustField = form.getTextField('BIETER_UST_ID');
      ustField.setText(company.taxId || '');
      console.log('✓ Filled BIETER_UST_ID');
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill UST_ID field');
    }

    // Commercial Register Number (HR-Nr)
    try {
      const hrField = form.getTextField('BIETER_HR_NR');
      hrField.setText(company.hrNr || '');
      console.log('✓ Filled BIETER_HR_NR');
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill HR_NR field');
    }

    // Date (current date)
    try {
      const datumField = form.getTextField('BIETER_DATUM');
      const today = new Date().toLocaleDateString('de-DE');
      datumField.setText(today);
      console.log('✓ Filled BIETER_DATUM with', today);
      fieldsFilledCount++;
    } catch (e) {
      console.log('⚠ Could not fill DATUM field');
    }

    console.log(`Successfully filled ${fieldsFilledCount} form fields`);

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
