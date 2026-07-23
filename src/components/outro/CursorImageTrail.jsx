"use client";

import React, { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";

// Automatically discover all images from public/picforfooter/ using Vite's glob import
const globImages = import.meta.glob('../../../public/picforfooter/*.{png,jpg,jpeg,webp,svg}');
const DISCOVERED_FOOTER_IMAGES = Object.keys(globImages).map((path) => {
    const filename = path.split('/').pop();
    return `/picforfooter/${filename}`;
});

const FALLBACK_FOOTER_IMAGES = [
    "/picforfooter/0908f5aa-9990-4c62-a444-fa407a361206.png",
    "/picforfooter/1ceea093-ee36-44db-b8f7-426c6017e09a.png",
    "/picforfooter/25174434-dfa2-410d-ace4-1246202d0d77.png",
    "/picforfooter/3aaef1cc-4b38-4f28-81ff-e4b9e53c1bba.png",
    "/picforfooter/554a274b-8aed-4bc3-929a-ba31782a5dc9.png",
    "/picforfooter/be0e58a0-a187-4a39-8f5e-b464ff1261de.png",
    "/picforfooter/c5d829cc-2283-470e-b067-29d8a2dd56af.png",
    "/picforfooter/ching-yeh-15027399-1482893901724315-5488430005339837980-n.jpg",
    "/picforfooter/ching-yeh-15027982-1476785615668477-910837414366041051-n.jpg",
    "/picforfooter/ching-yeh-15037106-1481466398533732-732973690613164058-n.jpg",
    "/picforfooter/ching-yeh-vr.jpg",
    "/picforfooter/eca8b32f-5e59-47eb-b6c0-af90a14a2fb3.png",
    "/picforfooter/fa83c0a9-3d2f-46da-9194-50ea28910e18.png",
    "/picforfooter/ff6db4b8-8719-49fe-b51c-b397eb15474e.png",
    "/picforfooter/filippo-ubertino-artguard-immaginefinale4low.jpg",
    "/picforfooter/jack-lee-render-v13.jpg"
];

const DEFAULT_URLS = DISCOVERED_FOOTER_IMAGES.length > 0
    ? DISCOVERED_FOOTER_IMAGES
    : FALLBACK_FOOTER_IMAGES;

const srcOf = (img) => (typeof img === "string" ? img : (img?.src ?? ""));

// Fisher-Yates shuffle helper (shuffles array once per page load)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Helper to draw image with object-fit: cover aspect ratio
function drawCoverImage(ctx, img, x, y, width, height) {
    const imgWidth = img.naturalWidth || width;
    const imgHeight = img.naturalHeight || height;
    const imgRatio = imgWidth / imgHeight;
    const targetRatio = width / height;

    let renderWidth = width;
    let renderHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > targetRatio) {
        renderWidth = height * imgRatio;
        offsetX = (width - renderWidth) / 2;
    } else {
        renderHeight = width / imgRatio;
        offsetY = (height - renderHeight) / 2;
    }

    ctx.drawImage(img, x + offsetX, y + offsetY, renderWidth, renderHeight);
}

export default function CursorImageTrail({
    images = DEFAULT_URLS,
    imageWidth = 150,
    imageHeight = 200,
    radius = 8,
    frequency = 35,
    visibleFor = 1,
    animate = false,
    ...rest
}) {
    const containerRef = useRef(null);
    const h1Ref = useRef(null);
    const canvasRef = useRef(null);
    const loadedImagesRef = useRef([]);
    const cardsRef = useRef([]);
    const animFrameRef = useRef(null);

    const [canvasDataUrl, setCanvasDataUrl] = useState('');
    const [currentSlot, setCurrentSlot] = useState(0);

    // Shuffle URLs once per page load
    const shuffledUrls = useMemo(() => {
        const list = (images && images.length ? images : DEFAULT_URLS)
            .map(srcOf)
            .filter(Boolean);
        return shuffleArray(list.length ? list : DEFAULT_URLS);
    }, [images]);

    const threshold = 200 - ((frequency - 1) * 199) / 49;

    // Preload HTMLImageElement instances for instant Canvas 2D rendering
    useEffect(() => {
        const loaded = [];
        shuffledUrls.forEach((url, index) => {
            const img = new Image();
            img.src = url;
            loaded[index] = img;
        });
        loadedImagesRef.current = loaded;
    }, [shuffledUrls]);

    // Measure H1 dimensions dynamically to align Canvas 2D size
    useLayoutEffect(() => {
        const el = h1Ref.current;
        if (!el) return;

        const updateCanvasSize = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            if (canvasRef.current) {
                canvasRef.current.width = Math.ceil(rect.width);
                canvasRef.current.height = Math.ceil(rect.height);
            }
        };

        updateCanvasSize();
        const ro = new ResizeObserver(updateCanvasSize);
        ro.observe(el);
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    // Canvas 2D Render Loop: Composites image cards onto Canvas 2D buffer
    const renderCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0 || canvas.height === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const now = performance.now();

        // Clear canvas context
        ctx.clearRect(0, 0, width, height);

        const ENTRY_DUR = 450; // ms
        const HOLD_DUR = visibleFor * 1000; // ms
        const EXIT_DUR = 450; // ms
        const TOTAL_DUR = ENTRY_DUR + HOLD_DUR + EXIT_DUR;

        const remainingCards = [];

        for (let i = 0; i < cardsRef.current.length; i++) {
            const card = cardsRef.current[i];
            const elapsed = now - card.startTime;

            if (elapsed >= TOTAL_DUR) {
                continue; // Card finished lifetime
            }

            let opacity = 1;
            let scale = 1;

            if (elapsed < ENTRY_DUR) {
                // Entry transition: cubic-bezier spring feel
                const t = elapsed / ENTRY_DUR;
                opacity = t;
                scale = 0.9 + 0.1 * Math.sin(t * (Math.PI / 2));
            } else if (elapsed < ENTRY_DUR + HOLD_DUR) {
                // Hold visible phase
                opacity = 1;
                scale = 1;
            } else {
                // Exit transition
                const t = (elapsed - ENTRY_DUR - HOLD_DUR) / EXIT_DUR;
                opacity = Math.max(0, 1 - t);
                scale = 1 - 0.05 * t;
            }

            remainingCards.push(card);

            // Draw card on 2D Canvas context
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.translate(card.x, card.y);
            ctx.scale(scale, scale);

            const halfW = imageWidth / 2;
            const halfH = imageHeight / 2;

            // Clip card with rounded rectangle corners (radius = 8px)
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(-halfW, -halfH, imageWidth, imageHeight, radius);
            } else {
                ctx.rect(-halfW, -halfH, imageWidth, imageHeight);
            }
            ctx.clip();

            const imgObj = loadedImagesRef.current[card.slot];
            if (imgObj && imgObj.complete && imgObj.naturalWidth > 0) {
                drawCoverImage(ctx, imgObj, -halfW, -halfH, imageWidth, imageHeight);
            } else {
                ctx.fillStyle = '#00f0ff';
                ctx.fillRect(-halfW, -halfH, imageWidth, imageHeight);
            }

            ctx.restore();
        }

        cardsRef.current = remainingCards;

        // Supply rendered Canvas buffer to background-clip: text layer
        setCanvasDataUrl(canvas.toDataURL());

        if (cardsRef.current.length > 0) {
            animFrameRef.current = requestAnimationFrame(renderCanvas);
        } else {
            animFrameRef.current = null;
        }
    };

    const triggerRender = () => {
        if (!animFrameRef.current) {
            animFrameRef.current = requestAnimationFrame(renderCanvas);
        }
    };

    // Pick next image slot, avoiding back-to-back immediate repeats
    const getNextSlot = (prevSlot, total) => {
        if (total <= 1) return 0;
        let next = Math.floor(Math.random() * total);
        while (next === prevSlot) {
            next = Math.floor(Math.random() * total);
        }
        return next;
    };

    const handleMouseMove = (event) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const lastCard = cardsRef.current[cardsRef.current.length - 1];
        const distance = lastCard
            ? Math.hypot(mouseX - lastCard.x, mouseY - lastCard.y)
            : Infinity;

        if (distance > threshold) {
            const nextSlot = getNextSlot(currentSlot, shuffledUrls.length);
            setCurrentSlot(nextSlot);

            cardsRef.current.push({
                id: Math.random(),
                slot: nextSlot,
                x: mouseX,
                y: mouseY,
                startTime: performance.now()
            });

            triggerRender();
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={`relative inline-flex items-center justify-center pointer-events-auto select-none p-4 ${animate ? 'animate-cinematic' : ''}`}
            {...rest}
        >
            {/* OFFSCREEN/BACKGROUND CANVAS 2D BUFFER ENGINE */}
            <canvas
                ref={canvasRef}
                className="hidden"
                aria-hidden="true"
            />

            {/* LAYER 1 (z-0): Solid Cyan Interior Fill Base H1 (No text glow) */}
            <h1
                ref={h1Ref}
                className="cinematic-watermark-initial cinematic-watermark-animate footer-author-name text-[14vw] sm:text-[15.5vw] leading-none select-none text-center whitespace-nowrap relative inline-flex items-center justify-center m-0 p-0 z-0"
                style={{
                    fontFamily: "'Rubik Variable', 'Rubik', sans-serif",
                    fontWeight: 900,
                    color: 'var(--accent-color)',
                    WebkitTextFillColor: 'var(--accent-color)',
                    textShadow: 'none',
                    gap: '0.04em'
                }}
            >
                {['K', 'a', 'v', 'y', 'a'].map((char, index) => (
                    <span key={index} className="inline-block text-center">{char}</span>
                ))}
            </h1>

            {/* LAYER 2 (z-10): SINGLE COMPOSITED CANVAS TRAIL LAYER (`background-clip: text`, 85% OPACITY FOR 15% CYAN UNDERNEATH) */}
            <h1
                aria-hidden="true"
                className="cinematic-watermark-initial cinematic-watermark-animate footer-author-name text-[14vw] sm:text-[15.5vw] leading-none select-none text-center whitespace-nowrap absolute inset-0 inline-flex items-center justify-center m-0 p-0 pointer-events-none z-10"
                style={{
                    fontFamily: "'Rubik Variable', 'Rubik', sans-serif",
                    fontWeight: 900,
                    gap: '0.04em',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    backgroundImage: canvasDataUrl ? `url(${canvasDataUrl})` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.85,
                    mixBlendMode: 'normal',
                    filter: 'none',
                    textShadow: 'none',
                }}
            >
                {['K', 'a', 'v', 'y', 'a'].map((char, index) => (
                    <span key={index} className="inline-block text-center">{char}</span>
                ))}
            </h1>

            {/* LAYER 3 (z-20): Thin Crisp 1px Cyan Outline Stroke (Frames letter edges only) */}
            <h1
                aria-hidden="true"
                className="cinematic-watermark-initial cinematic-watermark-animate footer-author-name text-[14vw] sm:text-[15.5vw] leading-none select-none text-center whitespace-nowrap absolute inset-0 inline-flex items-center justify-center pointer-events-none z-20 m-0 p-0"
                style={{
                    fontFamily: "'Rubik Variable', 'Rubik', sans-serif",
                    fontWeight: 900,
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                    WebkitTextStroke: '1px var(--accent-color)',
                    textShadow: 'none',
                    gap: '0.04em'
                }}
            >
                {['K', 'a', 'v', 'y', 'a'].map((char, index) => (
                    <span key={index} className="inline-block text-center">{char}</span>
                ))}
            </h1>

            {/* LAYER 4 (z-30): Soft Outer Cyan Glow */}
            <h1
                aria-hidden="true"
                className="cinematic-watermark-initial cinematic-watermark-animate footer-author-name text-[14vw] sm:text-[15.5vw] leading-none select-none text-center whitespace-nowrap absolute inset-0 inline-flex items-center justify-center pointer-events-none z-30 m-0 p-0"
                style={{
                    display: 'none',
                    fontFamily: "'Rubik Variable', 'Rubik', sans-serif",
                    fontWeight: 900,
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                    gap: '0.04em'
                }}
            >
                {['K', 'a', 'v', 'y', 'a'].map((char, index) => (
                    <span key={index} className="inline-block text-center">{char}</span>
                ))}
            </h1>
        </div>
    );
}
