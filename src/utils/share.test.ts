import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { canShare, canShareFiles, shareGameSummary } from './share';

describe('Share Utilities', () => {
  // Store original navigator
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    // Restore original navigator after each test
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe('canShare', () => {
    it('should return true when Web Share API is available', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      expect(canShare()).toBe(true);
    });

    it('should return false when Web Share API is not available', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(canShare()).toBe(false);
    });

    it('should return false when navigator is undefined', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(canShare()).toBe(false);
    });
  });

  describe('canShareFiles', () => {
    it('should return true when file sharing is supported', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: vi.fn(),
          canShare: vi.fn(() => true),
        },
        writable: true,
        configurable: true,
      });

      expect(canShareFiles([mockFile])).toBe(true);
    });

    it('should return false when Web Share API is not available', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(canShareFiles([mockFile])).toBe(false);
    });

    it('should return false when canShare method is not available', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      expect(canShareFiles([mockFile])).toBe(false);
    });

    it('should return false when canShare returns false for files', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: vi.fn(),
          canShare: vi.fn(() => false),
        },
        writable: true,
        configurable: true,
      });

      expect(canShareFiles([mockFile])).toBe(false);
    });
  });

  describe('shareGameSummary', () => {
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockLink: {
      click: ReturnType<typeof vi.fn>;
      download: string;
      href: string;
    };
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Mock link element
      mockLink = {
        click: vi.fn(),
        download: '',
        href: '',
      };

      mockCreateElement = vi.fn(() => mockLink);
      document.createElement = mockCreateElement as unknown as typeof document.createElement;

      // Mock URL methods
      mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      mockRevokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = mockCreateObjectURL as unknown as typeof URL.createObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL as unknown as typeof URL.revokeObjectURL;
    });

    it('should use Web Share API when file sharing is supported', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockShare,
          canShare: vi.fn(() => true),
        },
        writable: true,
        configurable: true,
      });

      await shareGameSummary(
        mockBlob,
        'test.png',
        'Test Title',
        'Test Text'
      );

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Test Title',
        text: 'Test Text',
        files: [expect.any(File)],
      });

      // Should not fall back to download
      expect(mockCreateElement).not.toHaveBeenCalled();
    });

    it('should fall back to download when Web Share API is not supported', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      await shareGameSummary(
        mockBlob,
        'test.png',
        'Test Title',
        'Test Text'
      );

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test.png');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should fall back to download when file sharing is not supported', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: vi.fn(),
          canShare: vi.fn(() => false),
        },
        writable: true,
        configurable: true,
      });

      await shareGameSummary(
        mockBlob,
        'test.png',
        'Test Title',
        'Test Text'
      );

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should not throw when user cancels share (AbortError)', async () => {
      const mockShare = vi.fn().mockRejectedValue(
        Object.assign(new Error('Share cancelled'), { name: 'AbortError' })
      );
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockShare,
          canShare: vi.fn(() => true),
        },
        writable: true,
        configurable: true,
      });

      // Should not throw
      await expect(
        shareGameSummary(mockBlob, 'test.png', 'Test Title', 'Test Text')
      ).resolves.toBeUndefined();
    });

    it('should throw when share fails with non-AbortError', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('Network error'));
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockShare,
          canShare: vi.fn(() => true),
        },
        writable: true,
        configurable: true,
      });

      await expect(
        shareGameSummary(mockBlob, 'test.png', 'Test Title', 'Test Text')
      ).rejects.toThrow('Network error');
    });
  });
});
