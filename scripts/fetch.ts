/**
 * 远程拉取代码
 */

import { exec } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import { DRACULA_DIR_NAME, DRACULA_TEMP_PATH } from './config';

const DRACULA_GITHUB_URL = 'https://github.com/dracula/visual-studio-code.git';

export default function fetchRemoteTheme() {
    if (!existsSync(DRACULA_TEMP_PATH)) {
        mkdirSync(DRACULA_TEMP_PATH);
    }

    const DRACULA_TEMP_DIR_PATH = path.join(
        DRACULA_TEMP_PATH,
        DRACULA_DIR_NAME,
    );

    if (existsSync(DRACULA_TEMP_DIR_PATH)) {
        console.log('\n删除当前已存在的主题');
        console.time('删除成功');
        rmSync(DRACULA_TEMP_DIR_PATH, {
            recursive: true,
            force: true,
            retryDelay: 1 * 1000,
        });
        console.timeEnd('删除成功');
    }

    return new Promise<void>((resolve) => {
        console.log('\n开始拉取远端主题配置文件');
        console.time('拉取成功');

        const fetchProcess = exec(
            `git clone ${DRACULA_GITHUB_URL}`,
            {
                cwd: DRACULA_TEMP_PATH,
                timeout: 10 * 1000, // 10s
            },
            (error) => {
                if (error) {
                    throw error;
                } else {
                    console.timeEnd('拉取成功');
                    resolve();
                }
            },
        );

        fetchProcess.stderr?.on('data', (chunk) => {
            console.log(chunk);
        });
    });
}

if (require.main === module) {
    fetchRemoteTheme();
}
