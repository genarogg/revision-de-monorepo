'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

interface LazyImageProps {
    src: string;
    alt?: string;
    blurDataURL?: string | null;
    className?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    responsive?: boolean;
    maxWidth?: string | number;
    sizes?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    priority?: boolean;
    quality?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt = '',
    blurDataURL = null,
    className = '',
    width = 300,
    height,
    aspectRatio,
    responsive = true,
    maxWidth = '100%',
    sizes,
    objectFit = 'cover',
    priority = false,
    quality,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    // Opacity separada del estado isLoaded para poder controlar el rAF
    const [imageOpacity, setImageOpacity] = useState(0);

    const computedHeight = height ?? Math.round(width * (aspectRatio ? 1 / aspectRatio : 2 / 3));
    const computedSizes = sizes ?? (responsive ? '100vw' : `${width}px`);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);

        if (!blurDataURL) {
            // Double rAF: garantiza que el browser pintó al menos un frame con
            // opacity:0 antes de activar la transición a opacity:1.
            // Sin esto, si la imagen viene de caché, onLoad dispara antes del
            // primer paint y el browser nunca tiene un estado desde el que transicionar.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setImageOpacity(1);
                });
            });
        }
    }, [blurDataURL]);

    const containerStyle: React.CSSProperties = responsive
        ? {
            position: 'relative',
            width: maxWidth,
            maxWidth: '100%',
            aspectRatio: aspectRatio
                ? String(aspectRatio)
                : `${width} / ${computedHeight}`,
        }
        : {
            position: 'relative',
            width,
            height: computedHeight,
        };

    // Opacity via inline style en el <Image> para evitar dos problemas:
    // 1. CSS inyectado en <style> JSX puede no aplicar al <img> de Next.js
    //    (Next.js pone sus propios estilos inline con mayor especificidad)
    // 2. Las clases CSS requieren que la transition ya esté en el elemento
    //    antes del cambio de estado — el inline style la lleva consigo siempre
    const imageStyle: React.CSSProperties = {
        objectFit,
        // Cuando hay blurDataURL, Next.js maneja la transición blur→nítido
        // internamente: no tocamos la opacity.
        ...(blurDataURL
            ? {}
            : {
                opacity: imageOpacity,
                transition: 'opacity 0.4s ease-in-out',
            }),
    };

    return (
        <>
            <style>{`
                .lazy-image { overflow: hidden; display: inline-block; }
                .lazy-image--responsive { display: block; }
                .lazy-image__skeleton {
                    position: absolute; inset: 0;
                    background-color: #d1d5db;
                    border-radius: 8px;
                    animation: lazy-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    /* transition en el skeleton SÍ funciona porque es un div propio */
                    transition: opacity 0.4s ease-in-out;
                    z-index: 1;
                    pointer-events: none;
                }
                .lazy-image__skeleton-content {
                    display: flex; align-items: center;
                    justify-content: center; height: 100%;
                }
                .lazy-image__skeleton-icon { width: 32px; height: 32px; color: #9ca3af; }
                @keyframes lazy-skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.5; }
                }
                @media (max-width: 768px) { .lazy-image__skeleton-icon { width: 24px; height: 24px; } }
                @media (max-width: 480px) { .lazy-image__skeleton-icon { width: 20px; height: 20px; } }
            `}</style>

            <div
                className={`lazy-image ${responsive ? 'lazy-image--responsive' : ''} ${className}`.trim()}
                style={containerStyle}
            >
                {/* Skeleton: opacity controlada por inline style (siempre funciona) */}
                {!blurDataURL && (
                    <div
                        className="lazy-image__skeleton"
                        style={{ opacity: isLoaded ? 0 : 1 }}
                        aria-hidden="true"
                    >
                        <div className="lazy-image__skeleton-content">
                            <svg
                                className="lazy-image__skeleton-icon"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                )}

                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={computedSizes}
                    style={imageStyle}
                    placeholder={blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={blurDataURL ?? undefined}
                    priority={priority}
                    quality={quality}
                    onLoad={handleLoad}
                />
            </div>
        </>
    );
};

export default LazyImage;