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

import {FileCollector, FileProcessor} from './dsl'
import {Logger} from './logger'

export class ArchiveManyToOne implements FileProcessor {
    private readonly logger: Logger
    private readonly basedir: string
    private readonly collector: FileCollector
    private readonly to_dir: string
    private readonly arcname: (time: Date) => string
    private readonly chown?: string

    constructor(
        label: string,
        basedir: string,
        collector: FileCollector,
        to_dir: string,
        arcname: (time: Date) => string,
        chown?: string,
    ) {
        this.logger = new Logger(`MANY2ONE[${label}]`)
        this.basedir = basedir
        this.collector = collector
        this.to_dir = to_dir
        this.arcname = arcname
        this.chown = chown
    }

    validate(): boolean {
        this.logger.info('basedir = %s', this.basedir)
        this.logger.info('to_dir = %s', this.to_dir)
        this.logger.info('arcname = %s', this.arcname)
        this.logger.info('chown = %s', this.chown)
        this.collector.validate()
        this.logger.close()
        return true
    }

    process(time: Date, dryRun: boolean): boolean {
        this.logger.info('time = %s', time)
        this.logger.info('dryRun = %s', dryRun)
        this.logger.close()
        return true
    }
}
