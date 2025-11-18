import { NextResponse } from 'next/server';
import { loadPdfTemplate, pdfTemplateExists } from '@/lib/pdfLoader';
import { PDFDocument } from 'pdf-lib';

/**
 * Example API route demonstrating how to load and work with PDF templates
 * GET /api/test-pdf?fileName=vertrag_v1.pdf
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'Missing fileName parameter' },
        { status: 400 }
      );
    }

    // Check if the file exists first
    const exists = await pdfTemplateExists(fileName);
    if (!exists) {
      return NextResponse.json(
        { error: `PDF template "${fileName}" not found` },
        { status: 404 }
      );
    }

    // Load the PDF template from filesystem
    const pdfBytes = await loadPdfTemplate(fileName);

    // Load it with pdf-lib to demonstrate it works
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get some info about the PDF
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || 'No title';
    const author = pdfDoc.getAuthor() || 'No author';

    return NextResponse.json({
      success: true,
      fileName,
      fileSize: pdfBytes.length,
      pageCount,
      metadata: {
        title,
        author,
      },
      message: 'PDF loaded successfully from filesystem',
    });
  } catch (error) {
    console.error('Error loading PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load PDF template',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
