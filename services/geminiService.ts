
export const generateProductPhotoFromImage = async (
    productImageData: {mimeType: string, data: string},
    bowlImageData: {mimeType: string, data: string},
    productName: string
  ): Promise<string> => {
  
  try {
    // This now calls our own secure backend endpoint on Vercel
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productImageData,
        bowlImageData,
        productName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error(errorData.error || 'Failed to generate image from the server.');
    }

    const data = await response.json();
    return data.generatedImage;

  } catch (error) {
    console.error("Error calling backend API:", error);
    // Re-throw a more user-friendly error
    throw new Error("The backend API could not be reached or returned an error.");
  }
};
