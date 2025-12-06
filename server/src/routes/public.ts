import express from 'express';
import ShopConfig from '../models/ShopConfig';

const router = express.Router();

router.get('/shop-config', async (req, res) => {
    try {
        let config = await ShopConfig.findOne();
        if (!config) {
            // Create default config if not exists
            config = await ShopConfig.create({});
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
