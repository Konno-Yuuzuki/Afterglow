/**
 * 验证是否有更新
 */

import { fetchDraculaNewestVersionNumber } from './fetch'
import packageLocal from '../package.json';
import core from '@actions/core'

export default async function canUpdate() {
    console.log('\n检查更新中...')
    const newestVersionNumber = await fetchDraculaNewestVersionNumber()
    const currentVersion = packageLocal.version

    if (newestVersionNumber === currentVersion) {
        core.setFailed('当前已是最新版本')
    }
}

if (require.main === module) {
    canUpdate()
}