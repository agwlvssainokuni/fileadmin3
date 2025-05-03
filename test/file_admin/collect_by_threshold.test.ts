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

import {beforeEach, describe, expect, it, vi} from 'vitest'
import {globSync} from 'fast-glob'
import {CollectByThreshold} from '../../src/file_admin/collect_by_threshold'

vi.mock('fast-glob', () => ({
    globSync: vi.fn(),
}))
const mockGlobSync = vi.mocked(globSync)

describe('CollectByThreshold', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('collect should return files based on pattern, condition, comparator, slicer, and threshold', () => {
        // 事前条件
        mockGlobSync.mockReturnValue([
            'file-20250101.log',
            'file-20250102.log',
            'file-20250103.log',
            'file-20250104.log',
        ])
        const instance = new CollectByThreshold(
            ['*.log'],
            (f) => f.match(/-(\d{8})\.log$/), // extra_cond
            (a, b) => a.localeCompare(b), // comparator
            (f) => f.match(/-(\d{8})\.log$/)?.[1], // slicer
            (_) => '20250103' // threshold
        )

        // 実行
        const result = instance.collect(new Date())

        // 検証
        expect(result).toEqual([
            'file-20250101.log',
            'file-20250102.log',
        ]) // しきい値より古いファイルを残す
    })

    it('collect should handle empty results gracefully', () => {
        // 事前条件
        mockGlobSync.mockReturnValue([])
        const instance = new CollectByThreshold(
            ['*.log'],
            (f) => f.match(/-(\d{8})\.log$/), // extra_cond
            (a, b) => a.localeCompare(b), // comparator
            (f) => f.match(/-(\d{8})\.log$/)?.[1], // slicer
            (_) => '20250103' // threshold
        )

        // 実行
        const result = instance.collect(new Date())

        // 検証
        expect(result).toEqual([])
    })
})
