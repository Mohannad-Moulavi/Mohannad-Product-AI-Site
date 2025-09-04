import React, { useState, useCallback } from 'react';
import { ProductInputForm } from './components/ProductInputForm';
import { ImageDisplay } from './components/ImageDisplay';
import { generateProductPhotoFromImage } from './services/geminiService';

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    mimeType: file.type,
    data: await base64EncodedDataPromise,
  };
};


const App: React.FC = () => {
  const [productFile, setProductFile] = useState<File | null>(null);
  const [bowlFile, setBowlFile] = useState<File | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [downloadFileName, setDownloadFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!productFile || !bowlFile || !productName) {
      setError('Please upload both images and enter the product name.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const productImageData = await fileToGenerativePart(productFile);
      const bowlImageData = await fileToGenerativePart(bowlFile);
      const generatedImageData = await generateProductPhotoFromImage(productImageData, bowlImageData, productName, productDescription);
      setGeneratedImage(generatedImageData);
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [productFile, bowlFile, productName, productDescription]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 tracking-tight">
            AI Product Photos for Nuts & Dried Fruits
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Instantly create professional photos. Just upload your product and a bowl, and let AI do the rest.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <ProductInputForm
              productFile={productFile}
              onProductFileSelect={setProductFile}
              bowlFile={bowlFile}
              onBowlFileSelect={setBowlFile}
              productName={productName}
              onProductNameChange={setProductName}
              productDescription={productDescription}
              onProductDescriptionChange={setProductDescription}
              downloadFileName={downloadFileName}
              onDownloadFileNameChange={setDownloadFileName}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <p>{error}</p>
              </div>
            )}
          </div>
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 aspect-square">
            <ImageDisplay 
              isLoading={isLoading} 
              generatedImage={generatedImage} 
              downloadFileName={downloadFileName}
            />
          </div>
        </main>
        
        <footer className="text-center mt-12 text-gray-400 text-sm">
          <p>Powered by Google Gemini. Images are AI-generated.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;