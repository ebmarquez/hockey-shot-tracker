/**
 * Share utilities for Web Share API with fallback support
 */

/**
 * Check if Web Share API is available
 */
export const canShare = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.share !== undefined;
};

/**
 * Check if Web Share API supports sharing files
 */
export const canShareFiles = (files: File[]): boolean => {
  try {
    return (
      canShare() &&
      navigator.canShare !== undefined &&
      navigator.canShare({ files })
    );
  } catch {
    // Some browsers throw when canShare is called with files
    return false;
  }
};

/**
 * Share game summary with Web Share API or fallback to download
 * @param blob Image blob to share
 * @param filename Filename for the image
 * @param title Share title
 * @param text Share text/caption
 */
export const shareGameSummary = async (
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<void> => {
  const file = new File([blob], filename, { type: 'image/png' });

  // Try Web Share API with file support
  if (canShareFiles([file])) {
    try {
      await navigator.share({
        title,
        text,
        files: [file],
      });
    } catch (error) {
      // User cancelled or share failed
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled - this is not an error, just return
        return;
      }
      // Other errors - rethrow
      throw error;
    }
  } else {
    // Fallback: download the image
    const dataUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    URL.revokeObjectURL(dataUrl);
  }
};
