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

import {describe, expect, it, vi} from 'vitest'
import {globSync} from 'fast-glob'
import {CollectByGeneration} from '../../src/file_admin/collect_by_generation'

vi.mock('fast-glob', () => ({
    globSync: vi.fn(),
}))

describe('CollectByGeneration', () => {
    it('validate should always return true', () => {
        const instance = new CollectByGeneration(['*.log'])
        expect(instance.validate()).toBe(true)
    })

    it('collect should return files based on pattern, condition, comparator, and generation', () => {
        // モックの設定
        vi.mocked(globSync).mockImplementation((pattern) => {
            if (pattern === '*.log') {
                return ['file1.log', 'file2.log', 'file3.log', 'file4.log']
            }
            return []
        })

        const instance = new CollectByGeneration(
            ['*.log'],
            (f) => f.includes('file'), // extra_cond
            (a, b) => a.localeCompare(b), // comparator
            2 // generation
        )

        const result = instance.collect(new Date())
        expect(result).toEqual(['file1.log', 'file2.log']) // 古い2つを残す
    })

    it('collect should handle empty results gracefully', () => {
        vi.mocked(globSync).mockReturnValue([])

        const instance = new CollectByGeneration(['*.log'])
        const result = instance.collect(new Date())
        expect(result).toEqual([])
    })
})
