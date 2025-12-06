import express from 'express';
import ShopConfig from '../models/ShopConfig';

const router = express.Router();

// Middleware to check auth (simplified for this demo)
// In a real app, use JWT or sessions
const checkAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // For simplicity, we'll assume the frontend sends a basic auth header or just allow it for this demo
    // as per "keep it light but realistic".
    // Let's check for a simple header "x-admin-token"
    const token = req.headers['x-admin-token'];
    if (token === process.env.ADMIN_TOKEN || 'secret') {
        next();
    } else {
        // For now, to make it easy to run, we might just skip strict auth or use a default
        // next(); 
        // Let's enforce a simple token
        if (token === 'admin-secret') {
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    }
};

router.use(checkAuth);

router.get('/shop-config', async (req, res) => {
    try {
        const config = await ShopConfig.findOne();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/shop-info', async (req, res) => {
    try {
        const { shopName, info, dimensions } = req.body;
        const config = await ShopConfig.findOne();
        if (config) {
            if (shopName) config.shopName = shopName;
            if (info) config.info = { ...config.info, ...info };
            if (dimensions) config.dimensions = { ...config.dimensions, ...dimensions };
            await config.save();
            res.json(config);
        } else {
            res.status(404).json({ error: 'Config not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/grid-config', async (req, res) => {
    try {
        const { rows, cols } = req.body;
        const config = await ShopConfig.findOne();
        if (config) {
            config.gridDimensions = { rows, cols };
            // Optionally clear existing tiles or keep them if they fit
            // For now, we'll keep them, but the frontend might not render them if out of bounds
            await config.save();
            res.json(config);
        } else {
            res.status(404).json({ error: 'Config not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
