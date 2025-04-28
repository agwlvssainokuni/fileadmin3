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

import {globSync} from 'fast-glob'
import {lightFormat} from 'date-fns'
import {FileCollector} from './dsl'

export class CollectByThreshold implements FileCollector {
    private readonly pattern: string[]
    private readonly extra_cond: (f: string) => boolean
    private readonly comparator: (a: string, b: string) => number
    private readonly slicer: (f: string) => string
    private readonly threshold: (time: Date) => string

    constructor(
        pattern: string[],
        extra_cond?: (f: string) => boolean,
        comparator?: (a: string, b: string) => number,
        slicer?: (f: string) => string,
        threshold?: (time: Date) => string,
    ) {
        this.pattern = pattern
        this.extra_cond = extra_cond ?? (() => true)
        this.comparator = comparator ?? ((a, b) => a.localeCompare(b))
        this.slicer = slicer ?? ((f) => f)
        this.threshold = threshold ?? ((time) => lightFormat(time, 'yyyyMMdd'))
    }

    validate(): boolean {
        return true
    }

    collect(time: Date): string[] {
        const threshold = this.threshold(time)
        return this.pattern.flatMap(p => {
            const l = globSync(p).filter(this.extra_cond).sort(this.comparator)
            return l.filter(p => this.slicer(p).localeCompare(threshold) < 0)
        })
    }
}
