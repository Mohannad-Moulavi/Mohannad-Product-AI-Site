import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface ImageDisplayProps {
  isLoading: boolean;
  generatedImage: string | null;
  downloadFileName: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ isLoading, generatedImage, downloadFileName }) => {
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    
    // Sanitize filename to remove invalid characters, preserving unicode characters.
    // Invalid characters on most systems: \ / : * ? " < > |
    const sanitizedFileName = downloadFileName.trim().replace(/[\\/:*?"<>|]/g, '_');
    const finalFileName = sanitizedFileName ? `${sanitizedFileName}.png` : 'product-photo.png';

    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-700/50 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/80 backdrop-blur-sm z-10 transition-opacity duration-300">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300 font-semibold">Creating your product photo...</p>
        </div>
      )}

      {!generatedImage && !isLoading && (
        <div className="text-center text-gray-500">
          <PhotoIcon className="mx-auto h-24 w-24 text-gray-600" />
          <p className="mt-2 font-medium">Your generated image will appear here</p>
        </div>
      )}

      {generatedImage && (
        <>
          <img
            src={generatedImage}
            alt="Generated product"
            className="object-contain w-full h-full transition-opacity duration-500 ease-in-out opacity-100"
          />
          <button
            onClick={handleDownload}
            className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-gray-200 hover:bg-black hover:text-indigo-400 font-bold p-3 rounded-full shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Download image"
          >
            <DownloadIcon className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};