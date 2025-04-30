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

import fs from 'node:fs'
import path from 'node:path'
import {FileCollector, FileProcessor} from './dsl'
import {Logger} from './logger.ts'

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

    validate(): boolean {
        console.log(this.logger)
        return true
    }

    process(time: Date, dryRun: boolean): boolean {
        const to_dir = path.resolve(this.to_dir)
        const cwd = process.cwd()
        try {
            process.chdir(path.resolve(this.basedir))
            this.collector.collect(time).forEach((file) => {
                if (!dryRun) {
                    fs.renameSync(file, to_dir)
                }
            })
        } finally {
            process.chdir(cwd)
        }
        return true
    }
}
