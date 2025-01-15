# Frontend service for making API calls to backend

const API_BASE_URL = 'http://localhost:5000';

export const analyzeImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await fetch(`${API_BASE_URL}/analyze-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to analyze image');
        }

        return await response.json();
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
}; 