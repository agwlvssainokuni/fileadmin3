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
import {FileCollector} from './dsl'

export class CollectByGeneration implements FileCollector {
    private readonly pattern: string[]
    private readonly extra_cond: (f: string) => boolean
    private readonly comparator: (a: string, b: string) => number
    private readonly generation: number

    constructor(
        pattern: string[],
        extra_cond?: (f: string) => boolean,
        comparator?: (a: string, b: string) => number,
        generation?: number,
    ) {
        this.pattern = pattern
        this.extra_cond = extra_cond ?? (() => true)
        this.comparator = comparator ?? ((a, b) => a.localeCompare(b))
        this.generation = generation ?? 0
    }

    validate(): boolean {
        return true
    }

    collect(_: Date): string[] {
        return this.pattern.flatMap(p => {
            const l = globSync(p).filter(this.extra_cond).sort(this.comparator)
            return l.slice(0, l.length - this.generation)
        })
    }
}
