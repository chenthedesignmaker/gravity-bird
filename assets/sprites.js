// 游戏精灵图像数据
const SPRITE_DATA = {
    // 小鸟精灵 - 简单的几何形状组合
    bird: `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700"/>
                <stop offset="100%" style="stop-color:#FFA500"/>
            </linearGradient>
        </defs>
        <g transform="translate(20,20)">
            <circle cx="0" cy="0" r="15" fill="url(#birdGradient)"/>
            <circle cx="5" cy="-5" r="3" fill="black"/>
            <path d="M-5,0 Q0,5 5,0" stroke="black" stroke-width="2" fill="none"/>
            <path d="M-15,-5 L-25,0 L-15,5" fill="#FFA500"/>
        </g>
    </svg>`,

    // 管道精灵 - 带有渐变和纹理的管道
    pipe: `<svg width="50" height="300" viewBox="0 0 50 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#27ae60"/>
                <stop offset="100%" style="stop-color:#2ecc71"/>
            </linearGradient>
            <pattern id="pipePattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="10" height="10" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
            </pattern>
        </defs>
        <rect width="50" height="300" fill="url(#pipeGradient)"/>
        <rect width="50" height="300" fill="url(#pipePattern)"/>
        <rect x="0" y="0" width="50" height="10" fill="#229954"/>
        <rect x="0" y="290" width="50" height="10" fill="#229954"/>
    </svg>`,

    // 金币精灵 - 带有光晕效果的金币
    coin: `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="coinGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color:rgba(255,215,0,0.6)"/>
                <stop offset="100%" style="stop-color:rgba(255,215,0,0)"/>
            </radialGradient>
            <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ffd700"/>
                <stop offset="100%" style="stop-color:#daa520"/>
            </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="url(#coinGlow)"/>
        <circle cx="20" cy="20" r="15" fill="url(#coinGradient)" stroke="#b8860b" stroke-width="2"/>
        <text x="20" y="25" font-size="20" font-weight="bold" fill="#b8860b" text-anchor="middle">¥</text>
    </svg>`,

    // 云朵精灵 - 柔和的白色云朵
    cloud: `<svg width="100" height="60" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.9)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0.3)"/>
            </linearGradient>
        </defs>
        <g fill="url(#cloudGradient)">
            <circle cx="30" cy="30" r="20"/>
            <circle cx="50" cy="25" r="25"/>
            <circle cx="70" cy="30" r="20"/>
            <rect x="20" y="30" width="60" height="20" rx="10"/>
        </g>
    </svg>`
};

// 将SVG转换为图片的函数
function createImageFromSVG(svgString) {
    const blob = new Blob([svgString], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    return img;
}

// 创建游戏精灵
const SPRITES = {
    bird: createImageFromSVG(SPRITE_DATA.bird),
    pipe: createImageFromSVG(SPRITE_DATA.pipe),
    coin: createImageFromSVG(SPRITE_DATA.coin),
    cloud: createImageFromSVG(SPRITE_DATA.cloud)
};

// 导出精灵对象
export default SPRITES; 