import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreeShopScene from '../components/ThreeShopScene';
import { getShopConfig } from '../api';
import type { ShopConfig } from '../types';

const ShopView: React.FC = () => {
    const [config, setConfig] = useState<ShopConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getShopConfig()
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading Shop...</div>;
    if (!config) return <div>Failed to load shop configuration.</div>;

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <ThreeShopScene config={config} />

            {/* Overlay UI */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                maxWidth: '300px'
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{config.shopName}</h1>
                <p style={{ margin: '5px 0' }}><strong>Address:</strong> {config.info.address}</p>
                <p style={{ margin: '5px 0' }}><strong>Hours:</strong> {config.info.openingHours}</p>
                <p style={{ margin: '5px 0' }}><strong>Contact:</strong> {config.info.contactNumber}</p>
                {config.info.whatsappNumber && (
                    <p style={{ margin: '5px 0' }}><strong>WhatsApp:</strong> {config.info.whatsappNumber}</p>
                )}
                <div style={{ marginTop: '15px' }}>
                    <Link to="/admin" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Admin Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ShopView;
