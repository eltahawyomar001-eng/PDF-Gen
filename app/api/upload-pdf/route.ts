import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Nur PDF-Dateien sind erlaubt' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei ist zu groß. Maximale Größe: 10MB' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');

    // Upload to Vercel Blob Storage
    const blob = await put(`pdf-templates/${sanitizedFileName}`, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      fileName: sanitizedFileName,
      url: blob.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    );
  }
}
