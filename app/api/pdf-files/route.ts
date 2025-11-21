import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'pdf-templates');
    
    // Check if directory exists
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({ files: [] });
    }

    // Read all files from the directory
    const files = fs.readdirSync(templatesDir);
    
    // Filter only PDF files
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    return NextResponse.json({ files: pdfFiles });
  } catch (error) {
    console.error('Error reading PDF files:', error);
    return NextResponse.json(
      { error: 'Failed to read PDF files' },
      { status: 500 }
    );
  }
}
