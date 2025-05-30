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

import {renameSync} from 'fs'
import {basename, join, resolve} from 'path'
import {FileCollector, FileProcessor} from './dsl'
import {Logger} from './logger'

export class BackupFile implements FileProcessor {
    private readonly logger: Logger
    private readonly basedir: string
    private readonly collector: FileCollector
    private readonly to_dir: string

    constructor(
        label: string,
        basedir: string,
        collector: FileCollector,
        to_dir: string,
    ) {
        this.logger = new Logger(`BACKUP[${label}]`)
        this.basedir = basedir
        this.collector = collector
        this.to_dir = to_dir
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
            for (const file of files) {
                const srcFile = resolve(file)
                const dstFile = join(to_dir, basename(file))
                this.logger.debug('processing: rename %s to %s', srcFile, dstFile)
                if (!dryRun) {
                    try {
                        renameSync(srcFile, dstFile)
                    } catch (e) {
                        this.logger.error('rename %s to %s: NG, error=%s',
                            srcFile, dstFile, e)
                        return false
                    }
                }
                this.logger.info('rename %s to %s: OK', srcFile, dstFile)
            }
            this.logger.debug('end normally')
        } finally {
            this.logger.close()
            process.chdir(cwd)
        }

        return true
    }
}
