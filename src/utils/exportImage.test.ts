import { describe, it, expect, vi, beforeEach } from 'vitest';
import { elementToCanvas, canvasToBlob, exportToPNG } from './exportImage';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(),
}));

import html2canvas from 'html2canvas';

describe('Export Image Utilities', () => {
  let mockElement: HTMLElement;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create mock element
    mockElement = document.createElement('div');

    // Create mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('elementToCanvas', () => {
    it('should convert element to canvas using html2canvas', async () => {
      vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

      const result = await elementToCanvas(mockElement);

      expect(html2canvas).toHaveBeenCalledWith(mockElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
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
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockLink: {
      click: ReturnType<typeof vi.fn>;
      download: string;
      href: string;
    };

    beforeEach(() => {
      // Mock link element
      mockLink = {
        click: vi.fn(),
        download: '',
        href: '',
      };

      mockCreateElement = vi.fn(() => mockLink);
      document.createElement = mockCreateElement as unknown as typeof document.createElement;

      // Mock canvas methods
      mockCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
    });

    it('should export element as PNG with default filename', async () => {
      vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

      await exportToPNG(mockElement);

      expect(html2canvas).toHaveBeenCalledWith(mockElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(mockCreateElement).toHaveBeenCalledWith('a');
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
