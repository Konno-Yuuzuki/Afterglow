import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import packageLocal from '../package.json';
import { themeConfig, THEME_DIR } from './config';
import { fetchDraculaNewestVersionNumber, fetchRemoteThemeYaml } from './fetch';
import Generate from './generate';
import { PackageThemeType, ThemeType } from './type';
import loadToJSON from './yaml';

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
    packageLocal.version = versionNumber
    writeFileSync(
        path.join(__dirname, '..', 'package.json'),
        JSON.stringify(packageLocal, null, 2),
    );
    console.timeEnd('添加成功');
}

export default async function build() {
    if (!existsSync(THEME_DIR)) mkdirSync(THEME_DIR);

    console.log('\n检查更新中...')
    const newestVersionNumber = await fetchDraculaNewestVersionNumber()
    const currentVersion = packageLocal.version

    if (newestVersionNumber === currentVersion) {
        console.warn('当前已是最新版本')
        process.exit()
    }

    console.log('\n当前最新版本: ', newestVersionNumber)
    console.log('当前版本: ', currentVersion)

    const themeYaml = await fetchRemoteThemeYaml()
    const json = loadToJSON<ThemeType>(themeYaml);

    console.time('主题更新成功');
    console.group('\n开始更新主题文件:');

    themeConfig.forEach(({ custom, ...options }) => {
        const theme = new Generate(themeYaml, json).setOption(options).theme(custom);

        writeFileSync(
            path.resolve(THEME_DIR, theme.name + '.json'),
            JSON.stringify(theme, null, 4),
        );

        console.log(theme.name + '\t主题更新成功');
    });

    console.groupEnd();
    console.timeEnd('主题更新成功');

    configToPackage(newestVersionNumber);
}

if (require.main === module) {
    build();
}
