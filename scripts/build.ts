import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path, { dirname } from 'path';
import packageLocal from '../package.json';
import { themeConfig, THEME_DIR, yamlPath } from './config';
import Theme from './core/theme';
import { PackageThemeType, ThemeType } from './interface';
// import canUpdate from './validate';
import 'dotenv/config';
import { version } from '../package.json';
import {
    fetchDraculaNewestVersionNumber,
    fetchRemoteThemeYaml,
} from './yaml/fetch';
import loadToJSON from './yaml/yaml';

function configToPackage(versionNumber: string) {
    console.log('\n添加配置信息到package中：');
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
    packageLocal.contributes.themes = themes;
    packageLocal.version = versionNumber;
    writeFileSync(
        path.join(__dirname, '..', 'package.json'),
        JSON.stringify(packageLocal, null, 2),
    );
    console.timeEnd('添加成功');
}

function saveYaml(yaml: string) {
    if (!existsSync(dirname(yamlPath))) {
        mkdirSync(dirname(yamlPath));
    }
    writeFileSync(yamlPath, yaml, { encoding: 'utf-8' });
}

export default async function build() {
    if (!existsSync(THEME_DIR)) {
        mkdirSync(THEME_DIR);
    }

    const FETCH_NEW_FILE = process.env.FETCH_NEW_FILE === 'true';

    let newestVersionNumber = version;
    let themeYaml = '';

    if (FETCH_NEW_FILE) {
        newestVersionNumber = await fetchDraculaNewestVersionNumber();
        themeYaml = await fetchRemoteThemeYaml();
        saveYaml(themeYaml);
    } else {
        themeYaml = readFileSync(yamlPath, { encoding: 'utf-8' });
    }

    const json = loadToJSON<ThemeType>(themeYaml);

    console.time('主题更新成功');
    console.group('\n开始更新主题文件:');

    themeConfig.forEach(({ custom, ...options }) => {
        const theme = new Theme(themeYaml, json)
            .setOption(options)
            .theme(custom);

        writeFileSync(
            path.resolve(THEME_DIR, theme.name + '.json'),
            JSON.stringify(theme, null, 4),
        );

        console.log(theme.name, '\t', '主题更新成功');
    });

    console.groupEnd();
    console.timeEnd('主题更新成功');

    configToPackage(newestVersionNumber);
}

if (require.main === module) {
    build();
}
