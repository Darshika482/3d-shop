import React, { useState } from 'react';
import { uploadWallImage } from '../../api';

interface WallUploaderProps {
    wallName: string;
    currentImageUrl?: string;
    onUploadSuccess: (newUrl: string) => void;
    label: string;
}

const WallUploader: React.FC<WallUploaderProps> = ({ wallName, currentImageUrl, onUploadSuccess, label }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const result = await uploadWallImage(wallName, e.target.files[0]);
                onUploadSuccess(result.imageUrl);
            } catch (error) {
                console.error('Upload failed', error);
                alert('Upload failed');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{label}</h3>
            {currentImageUrl ? (
                <img
                    src={`http://localhost:5000${currentImageUrl}`}
                    alt={label}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', display: 'block', marginBottom: '10px' }}
                />
            ) : (
                <div style={{ width: '100px', height: '100px', background: '#eee', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No Image
                </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            {uploading && <span>Uploading...</span>}
        </div>
    );
};

export default WallUploader;
