import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Server-side utility to load PDF templates from filesystem or URL.
 * This should ONLY be used in server contexts (API routes, Server Actions, etc.)
 * 
 * @param source - Either a fileName (local file) or a full URL (blob storage)
 * @returns Uint8Array containing the PDF file data that can be used with pdf-lib
 * @throws Error if the file/URL doesn't exist or can't be read
 */
export async function loadPdfTemplate(source: string): Promise<Uint8Array> {
  // Ensure we're running on the server
  if (typeof window !== 'undefined') {
    throw new Error('loadPdfTemplate can only be called on the server side');
  }

  // Check if source is a URL (blob storage)
  if (source.startsWith('http://') || source.startsWith('https://')) {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      throw new Error(`Failed to load PDF from URL: ${(error as Error).message}`);
    }
  }

  // Otherwise, treat as local filename
  // Sanitize the fileName to prevent directory traversal attacks
  const sanitizedFileName = path.basename(source);
  
  // Construct the full path to the PDF template
  // In Next.js, process.cwd() points to the project root
  const filePath = path.join(process.cwd(), 'public', 'pdf-templates', sanitizedFileName);

  try {
    // Read the file as a Buffer, then convert to Uint8Array
    const buffer = await readFile(filePath);
    return new Uint8Array(buffer);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`PDF template not found: ${sanitizedFileName}`);
    }
    throw new Error(`Failed to load PDF template: ${(error as Error).message}`);
  }
}

/**
 * Check if a PDF template exists in the filesystem
 * 
 * @param fileName - The name of the PDF file
 * @returns boolean indicating if the file exists
 */
export async function pdfTemplateExists(fileName: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('pdfTemplateExists can only be called on the server side');
  }

  const sanitizedFileName = path.basename(fileName);
  const filePath = path.join(process.cwd(), 'public', 'pdf-templates', sanitizedFileName);

  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the full filesystem path to a PDF template
 * Useful for debugging or when you need the actual path
 * 
 * @param fileName - The name of the PDF file
 * @returns The absolute path to the PDF file
 */
export function getPdfTemplatePath(fileName: string): string {
  if (typeof window !== 'undefined') {
    throw new Error('getPdfTemplatePath can only be called on the server side');
  }

  const sanitizedFileName = path.basename(fileName);
  return path.join(process.cwd(), 'public', 'pdf-templates', sanitizedFileName);
}
