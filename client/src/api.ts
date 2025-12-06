import axios from 'axios';
import type { ShopConfig } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_CONFIG: ShopConfig = {
    shopName: 'Demo Shop',
    dimensions: { width: 8, height: 2.6, depth: 8 },
    walls: {
        front: { imageUrl: '' },
        back: { imageUrl: '' },
        right: { imageUrl: '' },
        floor: { color: '#e5e5e5', imageUrl: '' },
        ceiling: { color: '#f8f8f8', imageUrl: '' }
    },
    leftWallTiles: [],
    gridDimensions: { rows: 2, cols: 5 },
    info: {
        address: '123 Demo St, Virtual City',
        openingHours: '9:00 AM - 9:00 PM',
        contactNumber: '+1 234 567 8900',
        whatsappNumber: '+1 234 567 8900',
        description: 'A demo 3D shop experience.'
    }
};

export const getShopConfig = async (): Promise<ShopConfig> => {
    try {
        const response = await axios.get(`${API_URL}/shop-config`);
        return response.data;
    } catch (error) {
        console.warn('Failed to fetch shop config, using default mock data.', error);
        return DEFAULT_CONFIG;
    }
};

export const getAdminShopConfig = async (): Promise<ShopConfig> => {
    const response = await axios.get(`${API_URL}/admin/shop-config`, {
        headers: { 'x-admin-token': 'admin-secret' }
    });
    return response.data;
};

export const updateShopInfo = async (data: Partial<ShopConfig>): Promise<ShopConfig> => {
    const response = await axios.put(`${API_URL}/admin/shop-info`, data, {
        headers: { 'x-admin-token': 'admin-secret' }
    });
    return response.data;
};

export const updateGridConfig = async (rows: number, cols: number): Promise<ShopConfig> => {
    const response = await axios.put(`${API_URL}/admin/grid-config`, { rows, cols }, {
        headers: { 'x-admin-token': 'admin-secret' }
    });
    return response.data;
};

export const uploadWallImage = async (wall: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${API_URL}/admin/upload/${wall}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-admin-token': 'admin-secret'
        }
    });
    return response.data;
};

export const uploadLeftTile = async (row: number, col: number, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('row', row.toString());
    formData.append('col', col.toString());
    const response = await axios.post(`${API_URL}/admin/upload/left-tile`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-admin-token': 'admin-secret'
        }
    });
    return response.data;
};

export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${path}`;
};
