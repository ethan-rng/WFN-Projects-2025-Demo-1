import React, { useState } from 'react';
import { analyzeImage } from '../services/api';

const ImageUpload = ({ onAnalysisComplete }) => {
    const [loading, setLoading] = useState(false);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await analyzeImage(file);
            onAnalysisComplete(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handleImageUpload}
            />
            {loading && <p>Analyzing image...</p>}
        </div>
    );
};

export default ImageUpload; 