import html2canvas from 'html2canvas';

/**
 * Convert an element to canvas
 */
export const elementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  return await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  });
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
