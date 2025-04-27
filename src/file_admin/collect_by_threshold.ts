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

import {FileCollector} from "./interface.ts";

export class CollectByThreshold implements FileCollector {
    constructor(
        private readonly pattern: string[],
        private readonly extra_cond: (f: string) => boolean,
        private readonly comparator: (a: string, b: string) => number,
        private readonly slicer: (f: string) => string,
        private readonly threshold: number,
    ) {
    }

    validate(): boolean {
        console.log(this.pattern)
        console.log(this.extra_cond)
        console.log(this.comparator)
        console.log(this.slicer)
        console.log(this.threshold)
        return true
    }

    collect(time: Date): string[] {
        console.log({
            time: time,
        })
        console.log({
            pattern: this.pattern,
            extra_cond: this.extra_cond,
            comparator: this.comparator,
            slicer: this.slicer,
            threshold: this.threshold,
        })
        return []
    }
}
