import path from 'path';
import { GenerateOptions } from './generate';
import { CustomConfig } from './type';

export const DRACULA_PATH = path.join(__dirname, '..', 'src/dracula.yml');

export const THEME_DIR = path.resolve(__dirname, '..', 'theme');

export const themeConfig: GenerateOptions[] = [
    {
        name: 'Afterglow',
        ratioTarget: 4.5,
        resolution: 0.001,
    },
];

/**
 * 用于调整部分颜色或者信息
 */
export const customConfig: CustomConfig = {
    author: 'Konno Yuuzuki',
    maintainers: ['Konno Yuuzuki <Konno_Yuuzuki@outlook.com>'],
    semanticClass: 'theme.Afterglow',
    colors: {
        'panel.border': '&FG',
        'editor.lineHighlightBorder': '&FG',
    },
};
