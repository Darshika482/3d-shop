import React, { useState } from 'react';
import { uploadLeftTile, updateGridConfig, getImageUrl } from '../../api';
import type { ShopConfig } from '../../types';

interface LeftWallGridProps {
    config: ShopConfig;
    onConfigUpdate: () => void;
}

const LeftWallGrid: React.FC<LeftWallGridProps> = ({ config, onConfigUpdate }) => {
    const [uploading, setUploading] = useState<{ r: number, c: number } | null>(null);
    const [rows, setRows] = useState(config.gridDimensions?.rows || 2);
    const [cols, setCols] = useState(config.gridDimensions?.cols || 5);

    const handleTileUpload = async (r: number, c: number, file: File) => {
        setUploading({ r, c });
        try {
            await uploadLeftTile(r, c, file);
            onConfigUpdate();
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setUploading(null);
        }
    };

    const handleGridResize = async () => {
        try {
            await updateGridConfig(rows, cols);
            onConfigUpdate();
            alert('Grid dimensions updated');
        } catch (error) {
            console.error('Failed to update grid', error);
            alert('Failed to update grid');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>Left Wall Tiles</h3>

            <div style={{ marginBottom: '10px' }}>
                <label>Rows: <input type="number" value={rows} onChange={e => setRows(Number(e.target.value))} style={{ width: '50px' }} /></label>
                <label style={{ marginLeft: '10px' }}>Cols: <input type="number" value={cols} onChange={e => setCols(Number(e.target.value))} style={{ width: '50px' }} /></label>
                <button onClick={handleGridResize} style={{ marginLeft: '10px' }}>Update Grid</button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${config.gridDimensions?.cols || 5}, 1fr)`,
                gap: '5px',
                maxWidth: '100%',
                overflowX: 'auto'
            }}>
                {/* We need to render rows from top (max index) to bottom (0) to match visual representation if we want, 
            but usually grid is r0 at top or bottom. 
            Requirement: "row 0 (bottom), columns 0->4, then row 1 (top)"
            So visually, row 1 should be above row 0.
        */}
                {Array.from({ length: config.gridDimensions?.rows || 2 }).reverse().map((_, rIndex) => {
                    const r = (config.gridDimensions?.rows || 2) - 1 - rIndex; // Actual row index
                    return (
                        <React.Fragment key={`row-${r}`}>
                            {Array.from({ length: config.gridDimensions?.cols || 5 }).map((_, c) => {
                                const tile = config.leftWallTiles.find(t => t.row === r && t.col === c);
                                const isUploading = uploading?.r === r && uploading?.c === c;

                                return (
                                    <div key={`${r}-${c}`} style={{ border: '1px solid #ddd', padding: '5px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '10px', marginBottom: '5px' }}>R{r}:C{c}</div>
                                        {tile ? (
                                            <img
                                                src={getImageUrl(tile.imageUrl)}
                                                alt={`R${r}C${c}`}
                                                style={{ width: '100%', height: '50px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '50px', background: '#eee' }}></div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ width: '100%', fontSize: '10px' }}
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleTileUpload(r, c, e.target.files[0]);
                                            }}
                                            disabled={!!uploading}
                                        />
                                        {isUploading && <div style={{ fontSize: '10px' }}>Uploading...</div>}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default LeftWallGrid;
