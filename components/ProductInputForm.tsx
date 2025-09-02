import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';
import { UploadIcon } from './icons/UploadIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  isLoading: boolean;
  title: string;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, selectedFile, isLoading, title, id }) => {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  }, [selectedFile]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleClear = () => {
    onFileSelect(null);
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  return (
    <div>
      <label htmlFor={id} className="text-lg font-semibold text-gray-300">
        {title}
      </label>
      <div className="mt-2">
        {imagePreview ? (
          <div className="relative group">
            <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg object-cover max-h-48 border border-gray-600" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleClear} disabled={isLoading} className="bg-gray-900 text-gray-200 hover:bg-black px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                Change
              </button>
            </div>
          </div>
        ) : (
          <div 
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => document.getElementById(id)?.click()}
            className={`relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-900/20' : ''}`}
          >
            <input
              type="file"
              id={id}
              className="sr-only"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={isLoading}
            />
            <div className="flex flex-col items-center text-gray-400">
              <UploadIcon className="w-10 h-10 mb-2" />
              <span className="font-semibold">Drag & drop or <span className="text-indigo-400">click to upload</span></span>
              <p className="text-xs mt-1">PNG, JPG, or WEBP</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProductInputFormProps {
  onProductFileSelect: (file: File | null) => void;
  productFile: File | null;
  onBowlFileSelect: (file: File | null) => void;
  bowlFile: File | null;
  productName: string;
  onProductNameChange: (name: string) => void;
  downloadFileName: string;
  onDownloadFileNameChange: (name: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ProductInputForm: React.FC<ProductInputFormProps> = ({
  onProductFileSelect,
  productFile,
  onBowlFileSelect,
  bowlFile,
  productName,
  onProductNameChange,
  downloadFileName,
  onDownloadFileNameChange,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="flex flex-col space-y-6">
      <ImageUploader 
        title="1. Upload Product Image"
        id="product-image-upload"
        selectedFile={productFile}
        onFileSelect={onProductFileSelect}
        isLoading={isLoading}
      />

      <div>
        <label htmlFor="product-name-input" className="text-lg font-semibold text-gray-300">
          2. Enter Product Name
        </label>
        <input
          type="text"
          id="product-name-input"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          placeholder="e.g., Saffron threads"
          disabled={isLoading}
          required
          className="mt-2 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-800/50"
        />
      </div>
      
      <ImageUploader 
        title="3. Upload Bowl Image"
        id="bowl-image-upload"
        selectedFile={bowlFile}
        onFileSelect={onBowlFileSelect}
        isLoading={isLoading}
      />

      <div>
        <label htmlFor="filename-input" className="text-lg font-semibold text-gray-300">
          4. Set Download Filename (Optional)
        </label>
        <input
          type="text"
          id="filename-input"
          value={downloadFileName}
          onChange={(e) => onDownloadFileNameChange(e.target.value)}
          placeholder="e.g., my-awesome-product"
          disabled={isLoading}
          className="mt-2 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-800/50"
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !productFile || !bowlFile || !productName}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparkleIcon className="w-5 h-5 mr-2 -ml-1" />
            Generate Photo
          </>
        )}
      </button>
    </div>
  );
};