import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/3d-shop';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/upload', uploadRoutes);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
