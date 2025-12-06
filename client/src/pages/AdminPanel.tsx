import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminShopConfig, updateShopInfo } from '../api';
import type { ShopConfig } from '../types';
import WallUploader from '../components/admin/WallUploader';
import LeftWallGrid from '../components/admin/LeftWallGrid';

const AdminPanel: React.FC = () => {
    const [config, setConfig] = useState<ShopConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        shopName: '',
        address: '',
        openingHours: '',
        contactNumber: '',
        whatsappNumber: '',
        description: ''
    });

    const fetchConfig = () => {
        setLoading(true);
        getAdminShopConfig()
            .then(data => {
                setConfig(data);
                setFormData({
                    shopName: data.shopName,
                    address: data.info.address,
                    openingHours: data.info.openingHours,
                    contactNumber: data.info.contactNumber,
                    whatsappNumber: data.info.whatsappNumber,
                    description: data.info.description
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                alert('Failed to load admin config. Check console.');
            });
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateShopInfo({
                shopName: formData.shopName,
                info: {
                    address: formData.address,
                    openingHours: formData.openingHours,
                    contactNumber: formData.contactNumber,
                    whatsappNumber: formData.whatsappNumber,
                    description: formData.description
                }
            });
            alert('Shop info updated!');
            fetchConfig();
        } catch (error) {
            console.error(error);
            alert('Failed to update info');
        }
    };

    if (loading && !config) return <div>Loading Admin...</div>;
    if (!config) return <div>Error loading config</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin Panel</h1>
                <Link to="/" target="_blank">Open Shop View</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left Column: Shop Info */}
                <div>
                    <h2>Shop Information</h2>
                    <form onSubmit={handleInfoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label>
                            Shop Name:
                            <input
                                type="text"
                                value={formData.shopName}
                                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                                style={{ width: '100%', padding: '5px' }}
                            />
                        </label>
                        <label>
                            Address:
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', padding: '5px' }}
                            />
                        </label>
                        <label>
                            Opening Hours:
                            <input
                                type="text"
                                value={formData.openingHours}
                                onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                                style={{ width: '100%', padding: '5px' }}
                            />
                        </label>
                        <label>
                            Contact Number:
                            <input
                                type="text"
                                value={formData.contactNumber}
                                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                style={{ width: '100%', padding: '5px' }}
                            />
                        </label>
                        <label>
                            WhatsApp Number:
                            <input
                                type="text"
                                value={formData.whatsappNumber}
                                onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                style={{ width: '100%', padding: '5px' }}
                            />
                        </label>
                        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                            Save Info
                        </button>
                    </form>
                </div>

                {/* Right Column: Wall Management */}
                <div>
                    <h2>Wall Management</h2>

                    <WallUploader
                        label="Front Wall"
                        wallName="front"
                        currentImageUrl={config.walls.front.imageUrl}
                        onUploadSuccess={fetchConfig}
                    />

                    <WallUploader
                        label="Back Wall"
                        wallName="back"
                        currentImageUrl={config.walls.back.imageUrl}
                        onUploadSuccess={fetchConfig}
                    />

                    <WallUploader
                        label="Right Wall"
                        wallName="right"
                        currentImageUrl={config.walls.right.imageUrl}
                        onUploadSuccess={fetchConfig}
                    />

                    <WallUploader
                        label="Floor (Texture)"
                        wallName="floor"
                        currentImageUrl={config.walls.floor.imageUrl}
                        onUploadSuccess={fetchConfig}
                    />

                    <WallUploader
                        label="Ceiling (Texture)"
                        wallName="ceiling"
                        currentImageUrl={config.walls.ceiling.imageUrl}
                        onUploadSuccess={fetchConfig}
                    />

                    <LeftWallGrid config={config} onConfigUpdate={fetchConfig} />
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
