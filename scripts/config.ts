import path from 'path';
import { CustomConfig, ThemeConfig } from './type';

export const DRACULA_THEME_URL =
    'https://raw.githubusercontent.com/dracula/visual-studio-code/master/src/dracula.yml';
export const DRACULA_PACKAGE_URL = 'https://raw.githubusercontent.com/dracula/visual-studio-code/master/package.json'


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
