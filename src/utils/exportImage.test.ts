import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { elementToCanvas, canvasToBlob, exportToPNG } from './exportImage';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(),
}));

import html2canvas from 'html2canvas';

describe('Export Image Utilities', () => {
  let mockElement: HTMLElement;
  let mockCanvas: HTMLCanvasElement;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    // Store original createElement
    originalCreateElement = document.createElement.bind(document);
    
    // Create mock element
    mockElement = originalCreateElement('div');
    document.body.appendChild(mockElement);

    // Create mock canvas
    mockCanvas = originalCreateElement('canvas') as HTMLCanvasElement;
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    if (mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement);
    }
    // Remove any iframes left over
    document.querySelectorAll('iframe').forEach(iframe => iframe.remove());
  });

  describe('elementToCanvas', () => {
    it('should convert element to canvas using html2canvas with foreignObjectRendering', async () => {
      vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

      const result = await elementToCanvas(mockElement);

      // html2canvas should be called with a cloned element (not the original)
      // and with foreignObjectRendering: true option
      expect(html2canvas).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          foreignObjectRendering: true,
        })
      );
      expect(result).toBe(mockCanvas);
    });

    it('should throw error when html2canvas fails', async () => {
      const error = new Error('Canvas creation failed');
      vi.mocked(html2canvas).mockRejectedValue(error);

      await expect(elementToCanvas(mockElement)).rejects.toThrow('Canvas creation failed');
    });
  });

  describe('canvasToBlob', () => {
    it('should convert canvas to blob', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      
      // Mock toBlob method
      mockCanvas.toBlob = vi.fn((callback) => {
        callback(mockBlob);
      }) as unknown as typeof mockCanvas.toBlob;

      const result = await canvasToBlob(mockCanvas);

      expect(result).toBe(mockBlob);
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png'
      );
    });

    it('should reject when canvas.toBlob returns null', async () => {
      // Mock toBlob method returning null
      mockCanvas.toBlob = vi.fn((callback) => {
        callback(null);
      }) as unknown as typeof mockCanvas.toBlob;

      await expect(canvasToBlob(mockCanvas)).rejects.toThrow(
        'Failed to convert canvas to blob'
      );
    });
  });

  describe('exportToPNG', () => {
    let mockLink: {
      click: ReturnType<typeof vi.fn>;
      download: string;
      href: string;
    };

    beforeEach(() => {
      // Mock link element for download
      mockLink = {
        click: vi.fn(),
        download: '',
        href: '',
      };

      // Mock only anchor element creation for download
      const origCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as unknown as HTMLAnchorElement;
        }
        return origCreate(tagName);
      });

      // Mock canvas methods
      mockCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should export element as PNG with default filename', async () => {
      vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

      await exportToPNG(mockElement);

      expect(html2canvas).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          foreignObjectRendering: true,
        })
      );
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(mockLink.download).toBe('shot-chart.png');
      expect(mockLink.href).toBe('data:image/png;base64,mock');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should export element as PNG with custom filename', async () => {
      vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

      await exportToPNG(mockElement, 'custom-name.png');

      expect(mockLink.download).toBe('custom-name.png');
    });

    it('should log and throw error when export fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Export failed');
      vi.mocked(html2canvas).mockRejectedValue(error);

      await expect(exportToPNG(mockElement)).rejects.toThrow('Export failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to export PNG:', error);

      consoleErrorSpy.mockRestore();
    });
  });
});
