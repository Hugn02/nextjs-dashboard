'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

const createSvgPlaceholder = (text = 'Bat Trang', width = 400, height = 400) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="#FAF7F2"/>
        <rect x="2" y="2" width="${width - 4}" height="${height - 4}" stroke="#EDE0C4" stroke-width="2" fill="none"/>
        <g transform="translate(${width / 2}, ${height / 2 - 15})" text-anchor="middle">
            <path d="M-20 10 L-5 -15 L15 15 L25 0 L40 20 H-30 Z" fill="#C4A84F" opacity="0.7"/>
            <circle cx="-15" cy="-15" r="8" fill="#C4A84F" opacity="0.7"/>
            <text x="0" y="45" fill="#8B6914" font-family="serif, sans-serif" font-size="14" font-weight="bold">${text}</text>
        </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

interface Props extends Omit<ImageProps, 'onError'> {
    fallbackSrc?: string;
}

export default function ImageWithFallback({
    src,
    fallbackSrc,
    alt,
    unoptimized,
    ...props
}: Props) {
    const textAlt = typeof alt === 'string' && alt.trim() ? alt.slice(0, 15) : 'Bat Trang';
    const defaultFallback = fallbackSrc || `https://placehold.co/400x400/faf7f2/c4a84f.png?text=${encodeURIComponent(textAlt)}`;
    const svgFallback = createSvgPlaceholder(textAlt);

    const isValidSrc = Boolean(src && typeof src === 'string' && src.trim() !== '' && src !== 'null' && src !== 'undefined');
    const initialSrc = isValidSrc ? (src as string) : defaultFallback;

    const [imgSrc, setImgSrc] = useState<string>(initialSrc);
    const [failed, setFailed] = useState<boolean>(!isValidSrc);

    useEffect(() => {
        const valid = Boolean(src && typeof src === 'string' && src.trim() !== '' && src !== 'null' && src !== 'undefined');
        if (valid) {
            setImgSrc(src as string);
            setFailed(false);
        } else {
            setImgSrc(defaultFallback);
            setFailed(true);
        }
    }, [src, defaultFallback]);

    const handleError = () => {
        if (!failed || imgSrc !== svgFallback) {
            if (imgSrc !== defaultFallback) {
                setImgSrc(defaultFallback);
            } else {
                setImgSrc(svgFallback);
            }
            setFailed(true);
        }
    };

    const isUnoptimized = Boolean(
        unoptimized || 
        failed || 
        (typeof imgSrc === 'string' && (imgSrc.includes('placehold.co') || imgSrc.startsWith('data:')))
    );

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt || 'Sản phẩm Bát Tràng'}
            unoptimized={isUnoptimized}
            onError={handleError}
        />
    );
}

