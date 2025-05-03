/*
 * Copyright 2025 agwlvssainokuni
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {chownSync, unlinkSync, writeFileSync} from 'fs'
import {join, resolve} from 'path'
import AdmZip from 'adm-zip'
import {FileCollector, FileProcessor} from './dsl'
import {Logger} from './logger'

export class ArchiveManyToOne implements FileProcessor {
    private readonly logger: Logger
    private readonly basedir: string
    private readonly collector: FileCollector
    private readonly to_dir: string
    private readonly arcname: (time: Date) => string
    private readonly chown?: number | number[]
    private readonly retainOriginal?: boolean

    constructor(
        label: string,
        basedir: string,
        collector: FileCollector,
        to_dir: string,
        arcname: (time: Date) => string,
        chown?: number | number[],
        retainOriginal?: boolean,
    ) {
        this.logger = new Logger(`MANY2ONE[${label}]`)
        this.basedir = basedir
        this.collector = collector
        this.to_dir = to_dir
        this.arcname = arcname
        this.chown = chown
        this.retainOriginal = retainOriginal
    }

    process(time: Date, dryRun: boolean): boolean {
        this.logger.debug('start')

        const to_dir = resolve(this.to_dir)
        const cwd = process.cwd()
        try {
            process.chdir(resolve(this.basedir))
            const files = this.collector.collect(time)
            if (files.length === 0) {
                this.logger.debug('no files, skipped')
                return true
            }

            const arcfile = join(to_dir, this.arcname(time))
            this.logger.debug('processing: zip %s %s', arcfile, files.join(' '))
            if (!dryRun) {
                try {
                    const zip = new AdmZip()
                    for (const file of files) {
                        zip.addLocalFile(file)
                    }
                    writeFileSync(arcfile, zip.toBuffer())
                } catch (e) {
                    this.logger.error('zip %s %s: NG, error=%s',
                        arcfile, files.join(' '), e)
                    return false
                }
            }
            this.logger.info('zip %s %s: OK', arcfile, files.join(' '))

            if (!this.retainOriginal) {
                for (const file of files) {
                    const target = resolve(file)
                    this.logger.debug('processing: unlink %s', target)
                    if (!dryRun) {
                        try {
                            unlinkSync(target)
                        } catch (e) {
                            this.logger.error('unlink %s: NG, error=%s',
                                target, e)
                            return false
                        }
                    }
                    this.logger.info('unlink %s: OK', target)
                }
            }

            if (this.chown) {
                const {uid, gid} = this.parseChown(this.chown)
                this.logger.debug('processing: chown %d:%d %s', uid, gid, arcfile)
                if (!dryRun) {
                    try {
                        chownSync(arcfile, uid, gid)
                    } catch (e) {
                        this.logger.error('chown %d:%d %s: NG, error=%s',
                            uid, gid, arcfile, e)
                        return false
                    }
                }
            }

            this.logger.debug('end normally')
        } finally {
            this.logger.close()
            process.chdir(cwd)
        }

        return true
    }

    private parseChown = (chown: number[] | number): { uid: number, gid: number } => {
        if (this.chown instanceof Array) {
            return {
                uid: (chown as number[])[0] ?? -1,
                gid: (chown as number[])[1] ?? -1,

            }
        } else {
            return {
                uid: chown as number,
                gid: -1,
            }
        }
    }
}
