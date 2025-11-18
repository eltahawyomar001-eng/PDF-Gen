# PDF Click-to-Capture Coordinate System

## Overview
The admin can now click directly on the PDF preview to capture coordinates instead of manually typing x/y values.

## How It Works

### 1. Components Created

#### `PdfClickablePreview.tsx`
- Renders the first page of a PDF as a canvas using pdf.js
- Captures click events and transforms coordinates
- Displays visual feedback (red dot) at click position
- Shows PDF dimensions and instructions

#### `FieldManagerWithPreview.tsx`
- Wraps the field form and PDF preview together
- Manages captured coordinates state
- Passes coordinates to the field form
- Provides visual feedback when coordinates are captured

#### Updated `PdfFieldForm.tsx`
- Now accepts `capturedCoordinates` prop
- Automatically fills x/y inputs when coordinates are captured
- Uses `useEffect` to update form when new coordinates arrive

### 2. Coordinate Transformation Logic

The key challenge is converting between two different coordinate systems:

#### Canvas/Screen Coordinates (What you click)
```
Origin: Top-left (0, 0)
X-axis: Left → Right
Y-axis: Top → Bottom

Example: 600×800 pixel display
┌─────────────────┐ (0, 0)
│                 │
│                 │
│      CLICK      │ (300, 100)
│                 │
│                 │
└─────────────────┘ (600, 800)
```

#### PDF Coordinates (PostScript/PDF Standard)
```
Origin: Bottom-left (0, 0)
X-axis: Left → Right (same as canvas)
Y-axis: Bottom → Top (OPPOSITE of canvas)

Example: 595×842 points (A4 size)
                   (595, 842)
┌─────────────────┐
│                 │
│                 │
│      TEXT       │ (297.5, 736.75)
│                 │
│                 │
└─────────────────┘ (0, 0)
```

### 3. Transformation Formula

```typescript
// Step 1: Get click position relative to canvas
const clickX = event.clientX - rect.left;
const clickY = event.clientY - rect.top;

// Step 2: Calculate scale factors
// (PDF might be displayed smaller/larger than actual size)
const scaleX = pdfDimensions.width / canvas.width;
const scaleY = pdfDimensions.height / canvas.height;

// Step 3: Scale click coordinates to PDF dimensions
const pdfX = clickX * scaleX;
const canvasScaledY = clickY * scaleY;

// Step 4: Flip Y-axis (most important step!)
// PDF origin is bottom-left, canvas origin is top-left
const pdfY = pdfDimensions.height - canvasScaledY;

// Step 5: Round for cleaner display
const finalX = Math.round(pdfX * 100) / 100;
const finalY = Math.round(pdfY * 100) / 100;
```

### 4. Example Transformation

**Scenario:**
- Display size: 600×800 pixels
- PDF size: 595×842 points (A4)
- User clicks at: (300, 100) - top-center area

**Calculation:**
```
1. scaleX = 595 / 600 = 0.9917
2. scaleY = 842 / 800 = 1.0525

3. pdfX = 300 × 0.9917 = 297.5
4. canvasScaledY = 100 × 1.0525 = 105.25

5. pdfY = 842 - 105.25 = 736.75

Result: (297.5, 736.75) in PDF coordinates
```

This places the text near the **top** of the page (high Y value in PDF coordinates).

## Usage Instructions

1. **Navigate to Template**: Go to `/admin/templates/[id]`

2. **View PDF Preview**: The right side shows the clickable PDF preview

3. **Click to Capture**: Click anywhere on the PDF where you want to place text

4. **Confirmation**: You'll see:
   - A red pulsing dot at the click position
   - A blue notification box showing captured coordinates
   - The x/y inputs automatically filled with the values

5. **Add Field**: Fill in the rest of the form (field key, label, etc.) and submit

6. **Visual Feedback**: Console logs show the transformation details for debugging

## Technical Details

### PDF.js Configuration
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### Canvas Rendering
- First page only (page 1)
- Default display width: 600px
- Maintains aspect ratio
- Renders at appropriate scale for crisp display

### State Management
- Captured coordinates flow: `PdfClickablePreview` → `FieldManagerWithPreview` → `PdfFieldForm`
- Coordinates are cleared after being used in the form
- Each click overwrites previous coordinates

## Why This Approach Works

1. **Accurate Scaling**: Accounts for any display size vs actual PDF size
2. **Proper Y-Axis Flip**: Correctly handles the inverted Y coordinate system
3. **Visual Feedback**: Users see exactly where they clicked
4. **Automatic Updates**: Coordinates automatically populate the form
5. **No Manual Math**: Admin doesn't need to calculate or guess coordinates

## Browser Compatibility

- Requires modern browser with Canvas API support
- PDF.js worker loaded from CDN
- Tested in Chrome, Firefox, Safari, Edge

## Future Enhancements

Potential improvements:
- Multi-page PDF support (select which page to click on)
- Zoom in/out on PDF preview
- Ruler/grid overlay for precise positioning
- Click and drag to define text box dimensions
- Preview of text placement before saving
