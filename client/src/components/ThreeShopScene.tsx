import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { ShopConfig } from '../types';
import { getImageUrl } from '../api';
import DualJoysticks from './DualJoysticks';

interface ThreeShopSceneProps {
    config: ShopConfig;
}

// --- Constants ---
const SHOP_WIDTH = 8;
const SHOP_HEIGHT = 2.6;
const SHOP_DEPTH = 8;
const DOOR_WIDTH = 1.2; // Wide enough to walk through
const COUNTER_HEIGHT = 1.0;
const COUNTER_DEPTH = 0.6;
const COUNTER_WIDTH = 3.0;
const COUNTER_Z_POS = -4.0; // Center of shop (Depth is 8)

// --- Helper Components ---

const SafeImagePlane = ({ imageUrl, ...props }: any) => {
    if (!imageUrl) {
        return (
            <mesh position={props.position} rotation={props.rotation}>
                <planeGeometry args={props.args} />
                <meshBasicMaterial color="#cccccc" side={THREE.DoubleSide} />
            </mesh>
        )
    }
    return <ImagePlane imageUrl={imageUrl} {...props} />
}

const ImagePlane = ({ imageUrl, position, rotation, args, transparent = false, opacity = 1 }: any) => {
    const texture = useTexture(imageUrl) as THREE.Texture;
    // Fix texture encoding/wrapping if needed
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={args} />
            <meshBasicMaterial
                map={texture}
                side={THREE.DoubleSide}
                transparent={transparent}
                opacity={opacity}
            />
        </mesh>
    )
}

// --- Main Scene Components ---

const ShopFacade = ({ config }: { config: ShopConfig }) => {
    // We split the facade into Left and Right panels to create a doorway
    // Facade is at Z = 0
    // Shop X goes from -SHOP_WIDTH/2 to +SHOP_WIDTH/2

    const halfShopWidth = SHOP_WIDTH / 2;
    const halfDoorWidth = DOOR_WIDTH / 2;

    // Left Panel: from -halfShopWidth to -halfDoorWidth
    const leftPanelWidth = halfShopWidth - halfDoorWidth;
    const leftPanelX = -halfShopWidth + (leftPanelWidth / 2);

    // Right Panel: from +halfDoorWidth to +halfShopWidth
    const rightPanelWidth = halfShopWidth - halfDoorWidth;
    const rightPanelX = halfDoorWidth + (rightPanelWidth / 2);

    const imageUrl = config.walls.front.imageUrl ? getImageUrl(config.walls.front.imageUrl) : null;

    return (
        <group>
            {/* Left Facade Panel */}
            <SafeImagePlane
                position={[leftPanelX, SHOP_HEIGHT / 2, 0]}
                rotation={[0, 0, 0]}
                args={[leftPanelWidth, SHOP_HEIGHT]}
                imageUrl={imageUrl}
            />
            {/* Right Facade Panel */}
            <SafeImagePlane
                position={[rightPanelX, SHOP_HEIGHT / 2, 0]}
                rotation={[0, 0, 0]}
                args={[rightPanelWidth, SHOP_HEIGHT]}
                imageUrl={imageUrl}
            />
            {/* Header/Signage above door? Optional */}
            <mesh position={[0, SHOP_HEIGHT - 0.2, 0]}>
                <boxGeometry args={[DOOR_WIDTH, 0.4, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
};

const ShopInterior = ({ config }: { config: ShopConfig }) => {
    const { walls, leftWallTiles, gridDimensions } = config;

    // Grid calculations
    const rows = gridDimensions?.rows || 2;
    const cols = gridDimensions?.cols || 5;
    const tileWidth = SHOP_DEPTH / cols;
    const tileHeight = SHOP_HEIGHT / rows;

    return (
        <group>
            {/* Floor (Inside) */}
            <mesh position={[0, 0, -SHOP_DEPTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[SHOP_WIDTH, SHOP_DEPTH]} />
                <meshStandardMaterial color={walls.floor.color || '#e5e5e5'} />
                {walls.floor.imageUrl && (
                    <SafeImagePlane
                        position={[0, 0, 0.01]}
                        rotation={[0, 0, 0]}
                        args={[SHOP_WIDTH, SHOP_DEPTH]}
                        imageUrl={getImageUrl(walls.floor.imageUrl)}
                    />
                )}
            </mesh>

            {/* Ceiling */}
            <mesh position={[0, SHOP_HEIGHT, -SHOP_DEPTH / 2]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[SHOP_WIDTH, SHOP_DEPTH]} />
                <meshStandardMaterial color={walls.ceiling.color || '#f8f8f8'} side={THREE.DoubleSide} />
                {walls.ceiling.imageUrl && (
                    <SafeImagePlane
                        position={[0, 0, -0.01]}
                        rotation={[0, 0, 0]}
                        args={[SHOP_WIDTH, SHOP_DEPTH]}
                        imageUrl={getImageUrl(walls.ceiling.imageUrl)}
                    />
                )}
            </mesh>

            {/* Back Wall */}
            {walls.back.imageUrl ? (
                <SafeImagePlane
                    position={[0, SHOP_HEIGHT / 2, -SHOP_DEPTH]}
                    rotation={[0, 0, 0]}
                    args={[SHOP_WIDTH, SHOP_HEIGHT]}
                    imageUrl={getImageUrl(walls.back.imageUrl)}
                />
            ) : (
                <mesh position={[0, SHOP_HEIGHT / 2, -SHOP_DEPTH]}>
                    <planeGeometry args={[SHOP_WIDTH, SHOP_HEIGHT]} />
                    <meshStandardMaterial color="#eeeeee" />
                </mesh>
            )}

            {/* Right Wall */}
            {walls.right.imageUrl ? (
                <SafeImagePlane
                    position={[SHOP_WIDTH / 2, SHOP_HEIGHT / 2, -SHOP_DEPTH / 2]}
                    rotation={[0, -Math.PI / 2, 0]}
                    args={[SHOP_DEPTH, SHOP_HEIGHT]}
                    imageUrl={getImageUrl(walls.right.imageUrl)}
                />
            ) : (
                <mesh position={[SHOP_WIDTH / 2, SHOP_HEIGHT / 2, -SHOP_DEPTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[SHOP_DEPTH, SHOP_HEIGHT]} />
                    <meshStandardMaterial color="#eeeeee" />
                </mesh>
            )}

            {/* Left Wall (Tiled) */}
            <group position={[-SHOP_WIDTH / 2, 0, 0]}>
                {Array.from({ length: rows }).map((_, r) =>
                    Array.from({ length: cols }).map((_, c) => {
                        const tile = leftWallTiles.find((t) => t.row === r && t.col === c);
                        const imageUrl = tile?.imageUrl ? getImageUrl(tile.imageUrl) : null;

                        // Z calculation: 
                        // We want the wall to go from Z=0 to Z=-SHOP_DEPTH
                        // Let's say col 0 is at Z=0 (front) and col N is at Z=-8 (back)
                        // Center of tile c: - (c * tileWidth + tileWidth/2)
                        const z = -(c * tileWidth + tileWidth / 2);

                        // Y calculation
                        const y = r * tileHeight + tileHeight / 2;

                        return (
                            <SafeImagePlane
                                key={`${r}-${c}`}
                                position={[0, y, z]}
                                rotation={[0, Math.PI / 2, 0]}
                                args={[tileWidth, tileHeight]}
                                imageUrl={imageUrl}
                            />
                        );
                    })
                )}
            </group>
        </group>
    );
};

const ShopCounter = () => {
    // A simple counter box
    return (
        <mesh position={[0, COUNTER_HEIGHT / 2, COUNTER_Z_POS]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[COUNTER_WIDTH, COUNTER_HEIGHT, COUNTER_DEPTH]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} /> {/* Wood-like brown */}
        </mesh>
    );
};

const SkySphere = () => {
    const texture = useTexture('/Day_Sunless.png') as THREE.Texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;

    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[50, 64, 64]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    );
};

const StreetEnvironment = () => {
    return (
        <group>
            {/* Sky */}
            <SkySphere />
            {/* Street Ground */}
            <mesh position={[0, 0, 5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color="#444444" />
            </mesh>
            {/* Sidewalk */}
            <mesh position={[0, 0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 2]} />
                <meshStandardMaterial color="#999999" />
            </mesh>
        </group>
    );
};

// --- Device Detection ---
const isMobileOrTablet = (): boolean => {
    // Check screen width (tablets typically < 1024px, phones < 768px)
    const isSmallScreen = window.innerWidth <= 1024;
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // Check user agent for mobile/tablet keywords
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(navigator.userAgent);

    return isSmallScreen || (hasTouch && mobileUserAgent);
};

// --- Movement Bounds Configuration ---
const MOBILE_BOUNDS = {
    // Inside shop bounds (z < 0)
    minX: -SHOP_WIDTH / 2 + 0.5,
    maxX: SHOP_WIDTH / 2 - 0.5,
    minZ: -SHOP_DEPTH + 0.5,
    maxZ: 2.5, // Can only go slightly past door onto sidewalk
};

const DESKTOP_BOUNDS = {
    // More freedom for desktop users
    minX: -10,
    maxX: 10,
    minZ: -SHOP_DEPTH + 0.5,
    maxZ: 10, // Can explore street area
};

// --- Controls ---

const PlayerControls = ({ movementRef, isMobile }: {
    movementRef: React.MutableRefObject<{ moveX: number, moveZ: number, lookX: number, lookY: number }>,
    isMobile: boolean
}) => {
    const { camera, gl } = useThree();
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    // Select bounds based on device type
    const bounds = isMobile ? MOBILE_BOUNDS : DESKTOP_BOUNDS;

    useEffect(() => {
        camera.rotation.order = 'YXZ';

        const onPointerDown = (event: PointerEvent) => {
            isDragging.current = true;
            previousMousePosition.current = { x: event.clientX, y: event.clientY };
        };

        const onPointerUp = () => {
            isDragging.current = false;
        };

        const onPointerMove = (event: PointerEvent) => {
            if (isDragging.current) {
                const deltaX = event.clientX - previousMousePosition.current.x;
                const deltaY = event.clientY - previousMousePosition.current.y;
                previousMousePosition.current = { x: event.clientX, y: event.clientY };

                const rotationSpeed = 0.002;
                camera.rotation.y -= deltaX * rotationSpeed;
                camera.rotation.x -= deltaY * rotationSpeed;
                camera.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, camera.rotation.x));
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    movementRef.current.moveZ = 1; // Forward
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    movementRef.current.moveZ = -1; // Backward
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    movementRef.current.moveX = 1; // Left
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    movementRef.current.moveX = -1; // Right
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                case 'ArrowDown':
                case 'KeyS':
                    movementRef.current.moveZ = 0;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                case 'ArrowRight':
                case 'KeyD':
                    movementRef.current.moveX = 0;
                    break;
            }
        };

        const canvas = gl.domElement;
        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointermove', onPointerMove);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [movementRef, camera, gl]);

    useFrame((_, delta) => {
        const speed = 3.0 * delta;
        const lookSpeed = 2.0 * delta;

        // --- Rotation (Joystick) ---
        // lookX from joystick controls Yaw (rotation.y)
        // lookY from joystick controls Pitch (rotation.x)
        if (Math.abs(movementRef.current.lookX) > 0.05) {
            camera.rotation.y -= movementRef.current.lookX * lookSpeed;
        }
        if (Math.abs(movementRef.current.lookY) > 0.05) {
            camera.rotation.x -= movementRef.current.lookY * lookSpeed;
            camera.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, camera.rotation.x));
        }


        // --- Movement ---
        // moveZ: +1 is Forward, -1 is Backward
        // moveX: +1 is Left, -1 is Right

        // Re-calculating direction based on camera
        const forwardDir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
        forwardDir.y = 0; // Flatten to ground
        forwardDir.normalize();

        const rightDir = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation);
        rightDir.y = 0;
        rightDir.normalize();

        const moveVec = new THREE.Vector3();

        // Add forward component
        moveVec.addScaledVector(forwardDir, movementRef.current.moveZ * speed);

        // Add strafe component (moveX=1 is Left, so -rightDir)
        moveVec.addScaledVector(rightDir, -movementRef.current.moveX * speed);

        camera.position.add(moveVec);

        // Constrain height
        camera.position.y = 1.6;

        // --- Apply Movement Bounds ---
        // For mobile/tablet: Strict bounds to keep user in shop area
        // For desktop: More relaxed bounds with full shop interior constraints

        // Always apply lateral bounds when inside the shop
        if (camera.position.z < 0) {
            // Inside shop - constrain to shop walls
            if (camera.position.x < -SHOP_WIDTH / 2 + 0.5) camera.position.x = -SHOP_WIDTH / 2 + 0.5;
            if (camera.position.x > SHOP_WIDTH / 2 - 0.5) camera.position.x = SHOP_WIDTH / 2 - 0.5;
            if (camera.position.z < bounds.minZ) camera.position.z = bounds.minZ;
        } else {
            // Outside shop - apply device-specific bounds
            if (camera.position.x < bounds.minX) camera.position.x = bounds.minX;
            if (camera.position.x > bounds.maxX) camera.position.x = bounds.maxX;
            if (camera.position.z > bounds.maxZ) camera.position.z = bounds.maxZ;

            // For mobile: Also constrain to doorway area when outside
            if (isMobile) {
                // Can only be in front of the door area when outside
                if (camera.position.x < -DOOR_WIDTH) camera.position.x = -DOOR_WIDTH;
                if (camera.position.x > DOOR_WIDTH) camera.position.x = DOOR_WIDTH;
            }
        }
    });

    return null;
};


const ThreeShopScene: React.FC<ThreeShopSceneProps> = ({ config }) => {
    const [isLocked, setIsLocked] = useState(false);

    // Analog movement state
    // moveX: -1 (Right) to 1 (Left)
    // moveZ: -1 (Backward) to 1 (Forward)
    // lookX: -1 (Right) to 1 (Left)
    // lookY: -1 (Down) to 1 (Up)
    const movementRef = useRef({
        moveX: 0,
        moveZ: 0,
        lookX: 0,
        lookY: 0
    });

    const handleMove = (x: number, y: number) => {
        // Joystick returns x,y normalized (-1 to 1)
        // x: -1 (Left) to 1 (Right) -> We want +1 Left, -1 Right? 
        // Let's stick to standard: x is Right(+)/Left(-). 
        // Our logic expects moveX=1 for Left. So we invert x.
        movementRef.current.moveX = -x;

        // y: -1 (Up) to 1 (Down). 
        // We want moveZ=1 for Forward (Up). So we invert y.
        movementRef.current.moveZ = -y;
    };

    const handleLook = (x: number, y: number) => {
        // x: -1 (Left) to 1 (Right).
        // We want lookX to rotate Y. +lookX rotates Left?
        // Usually +RotationY is Left.
        // So if stick is Right (+x), we want -RotationY.
        // So lookX = x.
        movementRef.current.lookX = x;

        // y: -1 (Up) to 1 (Down).
        // We want lookY to rotate X (Pitch).
        // +RotationX is Down? No, +RotationX is looking Down.
        // So if stick is Down (+y), we want +RotationX.
        // So lookY = y.
        movementRef.current.lookY = y;
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* Instruction Overlay */}
            {!isLocked && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    zIndex: 10,
                    textAlign: 'center',
                    cursor: 'pointer'
                }} onClick={() => setIsLocked(true)}>
                    <h2>Click to Enter Shop</h2>
                    <p>Use Joysticks to Move & Look</p>
                    <p>Or WASD + Drag</p>
                    <p>Press ESC to exit control</p>
                </div>
            )}

            {/* Dual Joysticks Overlay */}
            {isLocked && <DualJoysticks onMove={handleMove} onLook={handleLook} />}

            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 1.6, 6]} fov={60} near={0.1} far={100} />
                <ambientLight intensity={0.6} />
                <pointLight position={[0, 2.4, -2]} intensity={0.8} castShadow />
                <pointLight position={[0, 2.4, -6]} intensity={0.8} />

                <React.Suspense fallback={null}>
                    <ShopFacade config={config} />
                    <ShopInterior config={config} />
                    <ShopCounter />
                    <StreetEnvironment />
                </React.Suspense>

                {isLocked && <PlayerControls movementRef={movementRef} />}
                {/* Fallback OrbitControls if not locked, just to look at facade */}
                {!isLocked && <OrbitControls target={[0, 1.6, 0]} minDistance={2} maxDistance={15} />}
            </Canvas>
        </div>
    );
};

export default ThreeShopScene;
