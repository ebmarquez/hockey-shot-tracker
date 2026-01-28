import html2canvas from 'html2canvas';

// Constants for canvas capture configuration
/** Scale factor for high-DPI output (2x = retina quality) */
const CAPTURE_SCALE = 2;
/** Padding added to iframe dimensions to prevent clipping */
const IFRAME_PADDING = 100;
/** Time in ms to wait for iframe to render before capturing */
const IFRAME_RENDER_DELAY = 100;

/**
 * Recursively apply ALL computed styles inline to an element and all its children.
 * This creates a complete visual snapshot that doesn't depend on external stylesheets.
 * This is necessary because html2canvas doesn't support oklch() colors from Tailwind CSS v4.
 */
const applyAllComputedStylesInline = (
  cloneElement: Element,
  originalElement: Element
): void => {
  if (cloneElement instanceof HTMLElement && originalElement instanceof HTMLElement) {
    const computedStyle = window.getComputedStyle(originalElement);
    
    // Copy ALL computed style properties to inline styles
    // This ensures the element looks the same without any stylesheets
    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i];
      const value = computedStyle.getPropertyValue(prop);
      if (value) {
        cloneElement.style.setProperty(prop, value);
      }
    }
  }
  
  // Handle SVG elements
  if (cloneElement instanceof SVGElement && originalElement instanceof SVGElement) {
    const computedStyle = window.getComputedStyle(originalElement);
    // Copy presentation attributes for SVG
    const svgProps = ['fill', 'stroke', 'stroke-width', 'opacity'];
    svgProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none') {
        cloneElement.setAttribute(prop, value);
      }
    });
  }
  
  // Process children recursively
  const children = Array.from(cloneElement.children);
  const originalChildren = Array.from(originalElement.children);
  
  children.forEach((child, index) => {
    if (originalChildren[index]) {
      applyAllComputedStylesInline(child, originalChildren[index]);
    }
  });
};

/**
 * Convert an element to canvas using an iframe to avoid oklch CSS parsing issues.
 * html2canvas doesn't support oklch() color functions from Tailwind CSS v4.
 * 
 * The approach:
 * 1. Create an isolated iframe (no stylesheets)
 * 2. Clone the element with all computed styles applied inline
 * 3. Use foreignObjectRendering to bypass CSS parsing
 */
export const elementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  // Create an iframe to completely isolate from main document's stylesheets
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position: fixed; left: -9999px; top: -9999px; visibility: hidden;';
  document.body.appendChild(iframe);
  
  try {
    const iframeDoc = iframe.contentDocument;
    
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }
    
    // Set iframe size to match element with padding to prevent clipping
    const rect = element.getBoundingClientRect();
    iframe.style.width = `${rect.width + IFRAME_PADDING}px`;
    iframe.style.height = `${rect.height + IFRAME_PADDING}px`;
    
    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply all computed styles inline before adding to iframe
    applyAllComputedStylesInline(clone, element);
    
    // Set up the iframe body with proper dimensions
    iframeDoc.body.style.cssText = 'margin: 0; padding: 0; background: white;';
    
    // Make sure the clone maintains its size
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.position = 'relative';
    
    iframeDoc.body.appendChild(clone);
    
    // Give the iframe time to render
    await new Promise(resolve => setTimeout(resolve, IFRAME_RENDER_DELAY));
    
    // Use html2canvas with foreignObjectRendering to bypass CSS parsing
    // This uses the browser's native rendering instead of html2canvas's CSS parser
    const canvas = await html2canvas(clone, {
      scale: CAPTURE_SCALE,
      backgroundColor: '#ffffff',
      logging: false,
      foreignObjectRendering: true,
    });
    
    return canvas;
  } finally {
    document.body.removeChild(iframe);
  }
};

/**
 * Convert canvas to Blob
 */
export const canvasToBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/png'
    );
  });
};

/**
 * Export an element as PNG image
 */
export const exportToPNG = async (
  element: HTMLElement,
  filename: string = 'shot-chart.png'
): Promise<void> => {
  try {
    const canvas = await elementToCanvas(element);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw error;
  }
};
