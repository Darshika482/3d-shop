export interface ShopConfig {
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
