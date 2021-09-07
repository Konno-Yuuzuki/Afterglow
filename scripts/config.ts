import path from 'path';
import { CustomConfig, ThemeConfig } from './type';

export const DRACULA_DIR_NAME = 'visual-studio-code';

export const DRACULA_TEMP_PATH = path.join(__dirname, '..', '.temp');

export const DRACULA_PATH = path.join(
    DRACULA_TEMP_PATH,
    DRACULA_DIR_NAME,
    'src/dracula.yml',
);

export const THEME_DIR = path.resolve(__dirname, '..', 'theme');

/**
 * 用于调整部分颜色或者信息
 */
const customConfig: CustomConfig = {
    author: 'Konno Yuuzuki',
    maintainers: ['Konno Yuuzuki <Konno_Yuuzuki@outlook.com>'],
    semanticClass: 'theme.Afterglow',
    colors: {
        'panel.border': '&FG', // 这里值可以是yaml文件中的锚点，也可以直接是hex
        'editor.lineHighlightBorder': '&FG',
    },
};

export const themeConfig: ThemeConfig[] = [
    {
        name: 'Afterglow-Light',
        ratioTarget: 4.5,
        resolution: 0.001,
        custom: customConfig,
    },
    {
        name: 'Afterglow-Light-Darker',
        ratioTarget: 7,
        backgroundColor: '#f5f3e8',
        resolution: 0.001,
        custom: customConfig,
    },
    {
        name: 'Afterglow-White',
        ratioTarget: 4.5,
        backgroundColor: '#ffffff',
        resolution: 0.001,
        custom: customConfig,
    },

    {
        name: 'Afterglow-White-Darker',
        ratioTarget: 7,
        backgroundColor: '#f2f4f6',
        resolution: 0.001,
        custom: customConfig,
    },
];
