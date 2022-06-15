/**
 * 验证是否有更新
 */

import * as core from '@actions/core';
import packageLocal from '../package.json';
import { fetchDraculaNewestVersionNumber } from './yaml/fetch';

export default async function canUpdate() {
    console.log('\n检查更新中...');
    const newestVersionNumber = await fetchDraculaNewestVersionNumber();
    const currentVersion = packageLocal.version;

    if (newestVersionNumber === currentVersion) {
        console.log('当前已是最新版本');
        const pid = core.getState('validate_process');
        process.kill(Number(pid));
    }
}

if (require.main === module) {
    canUpdate();
}
