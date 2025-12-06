import React, { useRef, useState, useEffect } from 'react';

interface CircularControllerProps {
    onUpdate: (x: number, y: number) => void;
    labelUp?: React.ReactNode;
    labelDown?: React.ReactNode;
    labelLeft?: React.ReactNode;
    labelRight?: React.ReactNode;
}

const CircularController: React.FC<CircularControllerProps> = ({ onUpdate, labelUp, labelDown, labelLeft, labelRight }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(true);
        updatePosition(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (active) {
            e.preventDefault();
            e.stopPropagation();
            updatePosition(e.clientX, e.clientY);
        }
    };

    const handlePointerUp = (e: PointerEvent) => {
        if (active) {
            e.preventDefault();
            e.stopPropagation();
            setActive(false);
            setPosition({ x: 0, y: 0 });
            onUpdate(0, 0);
        }
    };

    const updatePosition = (clientX: number, clientY: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const maxRadius = rect.width / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize if outside circle
        if (distance > maxRadius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxRadius;
            dy = Math.sin(angle) * maxRadius;
        }

        setPosition({ x: dx, y: dy });

        // Output normalized values (-1 to 1)
        onUpdate(dx / maxRadius, dy / maxRadius);
    };

    useEffect(() => {
        if (active) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [active]);

    return (
        <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(20, 20, 20, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                touchAction: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(5px)'
            }}
        >
            {/* Labels */}
            {labelUp && <div style={{ position: 'absolute', top: '15px', color: 'white', fontWeight: 'bold', fontSize: '12px', pointerEvents: 'none' }}>{labelUp}</div>}
            {labelDown && <div style={{ position: 'absolute', bottom: '15px', color: 'white', fontWeight: 'bold', fontSize: '12px', pointerEvents: 'none' }}>{labelDown}</div>}
            {labelLeft && <div style={{ position: 'absolute', left: '15px', color: 'white', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>{labelLeft}</div>}
            {labelRight && <div style={{ position: 'absolute', right: '15px', color: 'white', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>{labelRight}</div>}

            {/* Inner Ring (Orange Accents) */}
            <div style={{
                position: 'absolute',
                width: '60%',
                height: '60%',
                borderRadius: '50%',
                border: '2px solid rgba(255, 165, 0, 0.3)', // Faint orange
                pointerEvents: 'none'
            }}>
                {/* Orange segments simulation */}
                <div style={{ position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '4px', background: 'orange', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', bottom: '-2px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '4px', background: 'orange', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', left: '-2px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', width: '20px', height: '4px', background: 'orange', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', right: '-2px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', width: '20px', height: '4px', background: 'orange', borderRadius: '2px' }}></div>
            </div>

            {/* Center Thumb / Fingerprint */}
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'black',
                border: '1px solid rgba(255, 165, 0, 0.8)',
                position: 'absolute',
                transform: `translate(${position.x}px, ${position.y}px)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(255, 165, 0, 0.2)'
            }}>
                {/* Simple Fingerprint SVG Icon */}
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12M12 12c0 3-2.5 5.5-5.5 5.5S1 15 1 12M12 12c-3 0-5.5-2.5-5.5-5.5S9 1 12 1M12 12c3 0 5.5 2.5 5.5 5.5S15 23 12 23" opacity="0.5" />
                    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                </svg>
            </div>
        </div>
    );
};

export default CircularController;
