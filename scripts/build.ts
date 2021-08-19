import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { DRACULA_PATH, themeConfig, THEME_DIR } from './config';
import Generate from './generate';
import { ThemeType } from './type';
import loadToJSON from './yaml';

export default function build() {
    if (!existsSync(THEME_DIR)) mkdirSync(THEME_DIR);

    const yaml = readFileSync(DRACULA_PATH, 'utf-8');
    const json = loadToJSON<ThemeType>(yaml);

    themeConfig.forEach(({ custom, ...options }) => {
        const theme = new Generate(yaml, json).setOption(options).theme(custom);

        writeFileSync(
            path.resolve(THEME_DIR, theme.name + '.json'),
            JSON.stringify(theme, null, 4),
        );

        console.log(theme.name + '  主题生成成功');
    });
}

if (require.main === module) {
    console.log('开始生成主题文件');
    console.time('OK');
    build();
    console.timeEnd('OK');
}
