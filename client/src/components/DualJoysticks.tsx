import React from 'react';
import CircularController from './CircularController';

interface DualJoysticksProps {
    onMove: (x: number, y: number) => void;
    onLook: (x: number, y: number) => void;
}

const DualJoysticks: React.FC<DualJoysticksProps> = ({ onMove, onLook }) => {
    // Icons for labels
    const ArrowLeft = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    );

    const ArrowRight = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );

    const RotateLeft = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    );

    const RotateRight = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
        </svg>
    );

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '0',
            width: '100%',
            height: '180px',
            pointerEvents: 'none', // Let clicks pass through empty areas
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 40px',
            boxSizing: 'border-box',
            zIndex: 100
        }}>
            {/* Left Controller - Movement */}
            <div style={{ pointerEvents: 'auto' }}>
                <CircularController
                    onUpdate={onMove}
                    labelUp={<div style={{ transform: 'rotate(-90deg)' }}><ArrowRight /></div>}
                    labelDown={<div style={{ transform: 'rotate(90deg)' }}><ArrowRight /></div>}
                    labelLeft={<ArrowLeft />}
                    labelRight={<ArrowRight />}
                />
            </div>

            {/* Right Controller - Look */}
            <div style={{ pointerEvents: 'auto' }}>
                <CircularController
                    onUpdate={onLook}
                    labelUp="UP"
                    labelDown="DOWN"
                    labelLeft={<RotateLeft />}
                    labelRight={<RotateRight />}
                />
            </div>
        </div>
    );
};

export default DualJoysticks;
