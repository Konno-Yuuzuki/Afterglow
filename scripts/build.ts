import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { DRACULA_PATH, themeConfig, THEME_DIR } from './config';
import fetchRemoteTheme from './fetch';
import Generate from './generate';
import { PackageThemeType, ThemeType } from './type';
import loadToJSON from './yaml';
import packageJSON from '../package.json';

function configToPackage() {
    console.log('添加配置信息到package中：');
    console.time('添加成功');
    const themes = themeConfig.reduce<PackageThemeType[]>((arr, config) => {
        const { name } = config;
        arr.push({
            label: name.replace('-', ' '),
            uiTheme: 'vs',
            path: `./theme/${name}.json`,
        });
        return arr;
    }, []);
    packageJSON.contributes.themes = themes;
    writeFileSync(
        path.join(__dirname, '..', 'package.json'),
        JSON.stringify(packageJSON, null, 4),
    );
    console.timeEnd('添加成功');
}

export default async function build() {
    if (!existsSync(THEME_DIR)) mkdirSync(THEME_DIR);

    if (!existsSync(DRACULA_PATH)) {
        console.log('\n主题配置文件不存在');
        await fetchRemoteTheme();
    }

    const yaml = readFileSync(DRACULA_PATH, 'utf-8');
    const json = loadToJSON<ThemeType>(yaml);

    console.time('主题生成成功');

    console.group('\n开始生成主题文件:');

    themeConfig.forEach(({ custom, ...options }) => {
        const theme = new Generate(yaml, json).setOption(options).theme(custom);

        writeFileSync(
            path.resolve(THEME_DIR, theme.name + '.json'),
            JSON.stringify(theme, null, 4),
        );

        console.log(theme.name + '\t主题生成成功');
    });
    console.groupEnd();
    console.log('');
    console.timeEnd('主题生成成功');

    configToPackage();
}

if (require.main === module) {
    build();
}
