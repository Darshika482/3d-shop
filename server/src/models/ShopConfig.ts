import mongoose, { Schema, Document } from 'mongoose';

export interface IShopConfig extends Document {
    shopName: string;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    walls: {
        front: { imageUrl: string };
        back: { imageUrl: string };
        right: { imageUrl: string };
        floor: { imageUrl?: string; color?: string };
        ceiling: { imageUrl?: string; color?: string };
    };
    leftWallTiles: {
        row: number;
        col: number;
        imageUrl: string;
    }[];
    gridDimensions: {
        rows: number;
        cols: number;
    };
    info: {
        address: string;
        openingHours: string;
        contactNumber: string;
        whatsappNumber: string;
        description: string;
    };
}

const ShopConfigSchema: Schema = new Schema({
    shopName: { type: String, default: 'My 3D Shop' },
    dimensions: {
        width: { type: Number, default: 4 },
        height: { type: Number, default: 2.6 },
        depth: { type: Number, default: 8 },
    },
    walls: {
        front: { imageUrl: { type: String, default: '' } },
        back: { imageUrl: { type: String, default: '' } },
        right: { imageUrl: { type: String, default: '' } },
        floor: { imageUrl: String, color: { type: String, default: '#e5e5e5' } },
        ceiling: { imageUrl: String, color: { type: String, default: '#f8f8f8' } },
    },
    leftWallTiles: [
        {
            row: Number,
            col: Number,
            imageUrl: String,
        },
    ],
    gridDimensions: {
        rows: { type: Number, default: 2 },
        cols: { type: Number, default: 5 },
    },
    info: {
        address: { type: String, default: '' },
        openingHours: { type: String, default: '' },
        contactNumber: { type: String, default: '' },
        whatsappNumber: { type: String, default: '' },
        description: { type: String, default: '' },
    },
});

export default mongoose.model<IShopConfig>('ShopConfig', ShopConfigSchema);
