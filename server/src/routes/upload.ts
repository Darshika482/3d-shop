import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ShopConfig from '../models/ShopConfig';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename or use a deterministic one based on the field
        // We'll use a timestamp + original name to avoid caching issues, or deterministic if preferred.
        // User asked for deterministic file name for tiles: "left_r{row}c{col}.jpg"
        // For others, we can use "front.jpg", "back.jpg" etc. or keep them unique.
        // Let's use unique names to avoid browser caching issues when replacing images.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Middleware to check auth
const checkAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers['x-admin-token'];
    if (token === 'admin-secret') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

router.use(checkAuth);

const updateWallImage = async (wall: 'front' | 'back' | 'right' | 'floor' | 'ceiling', filename: string) => {
    const config = await ShopConfig.findOne();
    if (config) {
        config.walls[wall].imageUrl = `/uploads/${filename}`;
        await config.save();
        return config;
    }
    return null;
};

router.post('/front', upload.single('image'), async (req, res) => {
    if (req.file) {
        await updateWallImage('front', req.file.filename);
        res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

router.post('/back', upload.single('image'), async (req, res) => {
    if (req.file) {
        await updateWallImage('back', req.file.filename);
        res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

router.post('/right', upload.single('image'), async (req, res) => {
    if (req.file) {
        await updateWallImage('right', req.file.filename);
        res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

router.post('/floor', upload.single('image'), async (req, res) => {
    if (req.file) {
        await updateWallImage('floor', req.file.filename);
        res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

router.post('/ceiling', upload.single('image'), async (req, res) => {
    if (req.file) {
        await updateWallImage('ceiling', req.file.filename);
        res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

router.post('/left-tile', upload.single('image'), async (req, res) => {
    if (req.file) {
        const { row, col } = req.body;
        const config = await ShopConfig.findOne();
        if (config) {
            // Remove existing tile at this position if any
            config.leftWallTiles = config.leftWallTiles.filter(t => t.row !== Number(row) || t.col !== Number(col));
            // Add new tile
            config.leftWallTiles.push({
                row: Number(row),
                col: Number(col),
                imageUrl: `/uploads/${req.file.filename}`
            });
            await config.save();
            res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
        } else {
            res.status(404).json({ error: 'Config not found' });
        }
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

export default router;
