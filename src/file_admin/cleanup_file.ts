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
        console.log(this.logger)
        return true
    }

    process(time: Date, dryRun: boolean): boolean {
        const cwd = process.cwd()
        try {
            process.chdir(path.resolve(this.basedir))
            this.collector.collect(time).forEach((file) => {
                if (!dryRun) {
                    fs.unlinkSync(file)
                }
            })
        } finally {
            process.chdir(cwd)
        }
        return true
    }
}
