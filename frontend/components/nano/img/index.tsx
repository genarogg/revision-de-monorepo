'use client';

import React, { ReactNode } from 'react';
import LazyImage from './LazyImage';
import LazyBackgroundImage from './LazyBackgroundImage';

interface ResponsiveBreakpoint {
    minWidth?: number;
    maxWidth?: number;
    width?: number;
    height?: number;
    aspectRatio?: number;
}

interface SmartLazyImageProps {
    src: string;
    alt?: string;
    blurDataURL?: string | null;
    className?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    children?: ReactNode;
    // Props de LazyBackgroundImage
    objectFit?: 'cover' | 'contain';
    objectPosition?: string;
    style?: React.CSSProperties;
    // Props comunes responsive
    responsive?: boolean;
    maxWidth?: string | number;
    /**
     * Prop nativo de Next.js Image para srcset responsivo.
     * Reemplaza el sistema de breakpoints anterior.
     * Ejemplo: "(max-width: 768px) 100vw, 50vw"
     */
    sizes?: string;
    priority?: boolean;
    quality?: number;
}

const SmartLazyImage: React.FC<SmartLazyImageProps> = ({
    children,
    // Props exclusivas de LazyBackgroundImage
    objectPosition,
    style,
    // Props comunes
    objectFit = 'cover',
    responsive = true,
    maxWidth = '100%',
    sizes,
    priority = false,
    quality,
    ...rest
}) => {
    // Si tiene children → LazyBackgroundImage (imagen como fondo con contenido encima)
    if (children) {
        return (
            <LazyBackgroundImage
                {...rest}
                objectFit={objectFit}
                objectPosition={objectPosition}
                style={style}
                responsive={responsive}
                maxWidth={maxWidth}
                sizes={sizes}
                priority={priority}
                quality={quality}
            >
                {children}
            </LazyBackgroundImage>
        );
    }

    // Sin children → LazyImage (imagen estándar)
    // BUGFIX: la versión anterior intentaba desestructurar backgroundSize/Position/Repeat
    // de `props` cuando ya habían sido extraídas en los parámetros → siempre undefined.
    // Ahora esas props directamente no existen en el type, no hay que filtrarlas.
    return (
        <LazyImage
            {...rest}
            objectFit={objectFit}
            responsive={responsive}
            maxWidth={maxWidth}
            sizes={sizes}
            priority={priority}
            quality={quality}
        />
    );
};

export default SmartLazyImage;

export { default as LazyImage } from './LazyImage';
export { default as LazyBackgroundImage } from './LazyBackgroundImage';
export type { SmartLazyImageProps, ResponsiveBreakpoint };