/**
 * 远程拉取代码
 */

import https from 'https';
import { DRACULA_PACKAGE_URL, DRACULA_THEME_URL } from './config';
import { PackageType } from './type';


export function fetchDraculaNewestVersionNumber() {
    return new Promise<string>((resolve, reject) => {
        https.get(DRACULA_PACKAGE_URL, {
            timeout: 10 * 1000,
        }, (response) => {
            let packageStr = ''
            response.on('data', (chunk) => {
                packageStr += chunk
            }).on('end', () => {
                try {
                    const packageJSON = JSON.parse(packageStr) as PackageType
                    resolve(packageJSON.version)
                } catch (error) {
                    throw error
                }
            })
        }).on('error', (error) => {
            reject(error)
        })
    })
}

export function fetchRemoteThemeYaml() {
    return new Promise<string>((resolve, reject) => {
        https
            .get(DRACULA_THEME_URL, (response) => {
                let themeStr = '';
                response
                    .on('data', (chunk) => {
                        themeStr += chunk;
                    })
                    .on('end', () => {
                        resolve(themeStr);
                    });
            })
            .on('error', (error) => {
                reject(error)
            });
    });
}

