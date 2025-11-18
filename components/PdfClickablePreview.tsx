'use client';

import { useEffect, useRef, useState } from 'react';

// We'll import pdf.js dynamically to avoid SSR issues

interface PdfClickablePreviewProps {
  pdfUrl: string;
  onCoordinateClick: (x: number, y: number) => void;
  displayWidth?: number;
}

export default function PdfClickablePreview({
  pdfUrl,
  onCoordinateClick,
  displayWidth = 600,
}: PdfClickablePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let renderTask: any = null;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import pdf.js to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        
        // Configure worker using local build
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        // Get the first page
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        if (!isMounted) return;

        // Store original PDF dimensions (in PDF points)
        setPdfDimensions({
          width: viewport.width,
          height: viewport.height,
        });

        // Calculate scale to fit the display width
        const scale = displayWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        // Set up canvas
        const canvas = canvasRef.current;
        if (!canvas || !isMounted) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // Render the PDF page
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          intent: 'display' as const,
        };

        renderTask = page.render(renderContext as any);
        await renderTask.promise;
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (isMounted && err?.name !== 'RenderingCancelledException') {
          setError('Failed to load PDF preview');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    // Cleanup function
    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfUrl, displayWidth]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfDimensions || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get click position relative to canvas (top-left origin)
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    /**
     * COORDINATE TRANSFORMATION EXPLANATION:
     * 
     * 1. Canvas/Screen Coordinates:
     *    - Origin: Top-left corner (0, 0)
     *    - X increases: Left → Right
     *    - Y increases: Top → Bottom
     * 
     * 2. PDF Coordinates (PostScript/PDF standard):
     *    - Origin: Bottom-left corner (0, 0)
     *    - X increases: Left → Right (same as canvas)
     *    - Y increases: Bottom → Top (opposite of canvas)
     * 
     * 3. Transformation Steps:
     *    a) Calculate scale factor between display and PDF
     *    b) Scale click coordinates to PDF dimensions
     *    c) Flip Y-axis: PDF_Y = PDF_HEIGHT - CANVAS_Y
     * 
     * Example:
     *    - Canvas size: 600x800 (display)
     *    - PDF size: 595x842 (A4 in points)
     *    - Click at canvas (300, 100) [top-center area]
     *    - Scale X: 300 * (595/600) = 297.5
     *    - Scale Y: 100 * (842/800) = 105.25
     *    - Flip Y: 842 - 105.25 = 736.75
     *    - Result: (297.5, 736.75) in PDF coordinates [near top of page]
     */

    // Calculate the scale factor between displayed canvas and actual PDF
    const scaleX = pdfDimensions.width / canvas.width;
    const scaleY = pdfDimensions.height / canvas.height;

    // Scale the click coordinates to PDF dimensions
    const pdfX = clickX * scaleX;
    const canvasScaledY = clickY * scaleY;

    // Flip Y coordinate: PDF origin is bottom-left, canvas origin is top-left
    const pdfY = pdfDimensions.height - canvasScaledY;

    // Round to 2 decimal places for cleaner display
    const finalX = Math.round(pdfX * 100) / 100;
    const finalY = Math.round(pdfY * 100) / 100;

    // Store click position for visual feedback
    setClickPosition({ x: clickX, y: clickY });

    // Callback with PDF coordinates
    onCoordinateClick(finalX, finalY);

    console.log('Coordinate Transformation:', {
      canvas: { x: clickX, y: clickY, width: canvas.width, height: canvas.height },
      pdf: { x: finalX, y: finalY, width: pdfDimensions.width, height: pdfDimensions.height },
      scale: { x: scaleX, y: scaleY },
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            📄 PDF Vorschau - Klicken Sie, um Koordinaten zu erfassen
          </h3>
          <p className="text-xs text-gray-500">
            Klicken Sie auf eine Position im PDF, um die X/Y-Koordinaten automatisch zu erfassen
          </p>
          {pdfDimensions && (
            <p className="text-xs text-gray-400 mt-1">
              PDF-Größe: {pdfDimensions.width} × {pdfDimensions.height} Punkte
            </p>
          )}
        </div>

        <div className="relative inline-block">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
              <div className="text-gray-600">Lade PDF...</div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border border-gray-300 cursor-crosshair hover:border-blue-400 transition-colors"
            style={{ maxWidth: '100%', height: 'auto' }}
          />

          {/* Visual indicator for last click */}
          {clickPosition && (
            <div
              className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-lg pointer-events-none animate-ping"
              style={{
                left: clickPosition.x - 6,
                top: clickPosition.y - 6,
              }}
            />
          )}
          {clickPosition && (
            <div
              className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-lg pointer-events-none"
              style={{
                left: clickPosition.x - 6,
                top: clickPosition.y - 6,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
