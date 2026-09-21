'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import Image from 'next/image';

interface LazyBackgroundImageProps {
    src: string;
    alt?: string;
    blurDataURL?: string | null;
    className?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    children?: ReactNode;
    objectFit?: 'cover' | 'contain';
    objectPosition?: string;
    style?: React.CSSProperties;
    responsive?: boolean;
    maxWidth?: string | number;
    sizes?: string;
    priority?: boolean;
    quality?: number;
}

const LazyBackgroundImage: React.FC<LazyBackgroundImageProps> = ({
    src,
    alt = '',
    blurDataURL = null,
    className = '',
    width = 300,
    height,
    aspectRatio,
    children,
    objectFit = 'cover',
    objectPosition = 'center',
    style = {},
    responsive = true,
    maxWidth = '100%',
    sizes,
    priority = false,
    quality,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [imageOpacity, setImageOpacity] = useState(0);

    const computedHeight = height ?? Math.round(width * (aspectRatio ? 1 / aspectRatio : 2 / 3));
    const computedSizes = sizes ?? (responsive ? '100vw' : `${width}px`);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);

        if (!blurDataURL) {
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
            ...style,
        }
        : {
            position: 'relative',
            width,
            height: computedHeight,
            ...style,
        };

    const imageStyle: React.CSSProperties = {
        objectFit,
        objectPosition,
        zIndex: 0,
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
                .lazy-bg { overflow: hidden; display: inline-block; }
                .lazy-bg--responsive { display: block; }
                .lazy-bg__skeleton {
                    position: absolute; inset: 0;
                    background-color: #d1d5db;
                    border-radius: 8px;
                    animation: lazy-bg-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    transition: opacity 0.4s ease-in-out;
                    z-index: 1;
                    pointer-events: none;
                }
                .lazy-bg__skeleton-content {
                    display: flex; align-items: center;
                    justify-content: center; height: 100%;
                }
                .lazy-bg__skeleton-icon { width: 32px; height: 32px; color: #9ca3af; }
                .lazy-bg__content {
                    position: relative;
                    z-index: 2;
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                }
                @keyframes lazy-bg-pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.5; }
                }
                @media (max-width: 768px) { .lazy-bg__skeleton-icon { width: 24px; height: 24px; } }
                @media (max-width: 480px) { .lazy-bg__skeleton-icon { width: 20px; height: 20px; } }
            `}</style>

            <div
                className={`lazy-bg ${responsive ? 'lazy-bg--responsive' : ''} ${className}`.trim()}
                style={containerStyle}
            >
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

                {!blurDataURL && (
                    <div
                        className="lazy-bg__skeleton"
                        style={{ opacity: isLoaded ? 0 : 1 }}
                        aria-hidden="true"
                    >
                        <div className="lazy-bg__skeleton-content">
                            <svg
                                className="lazy-bg__skeleton-icon"
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

                {children && (
                    <div className="lazy-bg__content">
                        {children}
                    </div>
                )}
            </div>
        </>
    );
};

export default LazyBackgroundImage;