import html2canvas from 'html2canvas';

/**
 * Export an element as PNG image
 */
export const exportToPNG = async (
  element: HTMLElement,
  filename: string = 'shot-chart.png'
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

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
