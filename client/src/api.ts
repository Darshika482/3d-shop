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

// In-memory store for demo mode
let mockConfig: ShopConfig = { ...DEFAULT_CONFIG };

// Helper to simulate API delay
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const getShopConfig = async (): Promise<ShopConfig> => {
    try {
        const response = await axios.get(`${API_URL}/shop-config`);
        return response.data;
    } catch (error) {
        console.warn('Using mock data (Demo Mode)');
        return mockConfig;
    }
};

export const getAdminShopConfig = async (): Promise<ShopConfig> => {
    try {
        const response = await axios.get(`${API_URL}/admin/shop-config`, {
            headers: { 'x-admin-token': 'admin-secret' }
        });
        return response.data;
    } catch (error) {
        console.warn('Using mock data (Demo Mode)');
        return mockConfig;
    }
};

export const updateShopInfo = async (data: Partial<ShopConfig>): Promise<ShopConfig> => {
    try {
        const response = await axios.put(`${API_URL}/admin/shop-info`, data, {
            headers: { 'x-admin-token': 'admin-secret' }
        });
        return response.data;
    } catch (error) {
        console.warn('Mocking updateShopInfo');
        await mockDelay();
        mockConfig = { ...mockConfig, ...data, info: { ...mockConfig.info, ...data.info } };
        return mockConfig;
    }
};

export const updateGridConfig = async (rows: number, cols: number): Promise<ShopConfig> => {
    try {
        const response = await axios.put(`${API_URL}/admin/grid-config`, { rows, cols }, {
            headers: { 'x-admin-token': 'admin-secret' }
        });
        return response.data;
    } catch (error) {
        console.warn('Mocking updateGridConfig');
        await mockDelay();
        mockConfig = { ...mockConfig, gridDimensions: { rows, cols } };
        return mockConfig;
    }
};

export const uploadWallImage = async (wall: string, file: File): Promise<{ imageUrl: string }> => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post(`${API_URL}/admin/upload/${wall}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-admin-token': 'admin-secret'
            }
        });
        return response.data;
    } catch (error) {
        console.warn('Mocking uploadWallImage');
        await mockDelay();
        // Create a local object URL for the uploaded file
        const objectUrl = URL.createObjectURL(file);

        // Update mock config
        if (['front', 'back', 'right', 'floor', 'ceiling'].includes(wall)) {
            // @ts-ignore
            mockConfig.walls[wall].imageUrl = objectUrl;
        }

        return { imageUrl: objectUrl };
    }
};

export const uploadLeftTile = async (row: number, col: number, file: File): Promise<{ imageUrl: string }> => {
    try {
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
    } catch (error) {
        console.warn('Mocking uploadLeftTile');
        await mockDelay();
        const objectUrl = URL.createObjectURL(file);

        // Update or add tile
        const existingIndex = mockConfig.leftWallTiles.findIndex(t => t.row === row && t.col === col);
        if (existingIndex >= 0) {
            mockConfig.leftWallTiles[existingIndex].imageUrl = objectUrl;
        } else {
            mockConfig.leftWallTiles.push({ row, col, imageUrl: objectUrl });
        }

        return { imageUrl: objectUrl };
    }
};

export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${path}`;
};
