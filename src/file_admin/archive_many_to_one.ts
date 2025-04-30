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
        console.log(this.logger)
        console.log(this.basedir)
        this.collector.validate()
        console.log(this.collector)
        console.log(this.to_dir)
        console.log(this.arcname)
        console.log(this.chown)
        return true
    }

    process(time: Date, dryRun: boolean): boolean {
        console.log(this.logger)
        console.log({
            time: time,
            dryRun: dryRun,
        })
        console.log({
            basedir: this.basedir,
            collector: this.collector,
            to_dir: this.to_dir,
            arcname: this.arcname,
            chown: this.chown,
        })
        this.collector.collect(time)
        return true
    }
}
