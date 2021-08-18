import { GenerateOptions } from './generate';

export const config: GenerateOptions[] = [
    {
        name: 'Afterglow',
        ratioTarget: 4.5,
        resolution: 0.01,
    },
];

/**
 * 用于调整部分颜色或者信息
 */
export const customConfig = {
    color: {
        'panel.border': '&FG',
        'editor.lineHighlightBorder': '&FG',
    },
};
