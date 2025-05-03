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

import {unlinkSync} from 'fs'
import {resolve} from 'path'
import {FileCollector, FileProcessor} from './dsl'
import {Logger} from './logger'

export class CleanupFile implements FileProcessor {
    private readonly logger: Logger
    private readonly basedir: string
    private readonly collector: FileCollector

    constructor(
        label: string,
        basedir: string,
        collector: FileCollector,
    ) {
        this.logger = new Logger(`CLEANUP[${label}]`)
        this.basedir = basedir
        this.collector = collector
    }

    validate(): boolean {
        return true
    }

    process(time: Date, dryRun: boolean): boolean {
        this.logger.debug('start')

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
                this.logger.debug('processing: unlink %s', srcFile)
                if (!dryRun) {
                    try {
                        unlinkSync(srcFile)
                    } catch (e) {
                        this.logger.error('unlink %s NG, error=%s',
                            srcFile, e)
                        return false
                    }
                }
                this.logger.info('unlink %s: OK', srcFile)
            }
            this.logger.debug('end normally')
        } finally {
            this.logger.close()
            process.chdir(cwd)
        }

        return true
    }
}
