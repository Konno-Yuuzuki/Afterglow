/**
 * 验证是否有更新
 */

import { fetchDraculaNewestVersionNumber } from './fetch'
import packageLocal from '../package.json';

export default async function canUpdate() {
    console.log('\n检查更新中...')
    const newestVersionNumber = await fetchDraculaNewestVersionNumber()
    const currentVersion = packageLocal.version

    if (newestVersionNumber === currentVersion) {
        console.warn('当前已是最新版本')
        throw new Error('当前已是最新版本')
    }
}

if (require.main === module) {
    canUpdate()
}