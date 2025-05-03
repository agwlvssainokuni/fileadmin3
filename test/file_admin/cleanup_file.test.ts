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
import {unlinkSync} from 'fs'
import {resolve} from 'path'
import {CleanupFile} from '../../src/file_admin/cleanup_file'
import {FileCollector} from '../../src/file_admin/dsl'

vi.mock('fs')
const mockUnlinkSync = vi.mocked(unlinkSync)

describe('CleanupFile', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('process should delete files based on collector results', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log', 'file3.log'],
        }

        // 実行
        const instance = new CleanupFile('test-label', '.', collector)
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(true)
        expect(mockUnlinkSync).toHaveBeenCalledTimes(3)
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file1.log'))
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file2.log'))
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file3.log'))
    })

    it('process should not delete files in dryRun mode', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }

        // 実行
        const instance = new CleanupFile('test-label', '.', collector)
        const result = instance.process(new Date(), true)

        // 検証
        expect(result).toBe(true)
        expect(mockUnlinkSync).not.toHaveBeenCalled()
    })

    it('process should handle empty collector results gracefully', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => [],
        }

        // 実行
        const instance = new CleanupFile('test-label', '.', collector)
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(true)
        expect(mockUnlinkSync).not.toHaveBeenCalled()
    })

    it('process should return false if unlinkSync throws an error', () => {
        // 事前条件
        mockUnlinkSync.mockImplementation(() => {
            throw new Error('unlink error')
        })
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }

        // 実行
        const instance = new CleanupFile('test-label', '.', collector)
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(false)
        expect(mockUnlinkSync).toHaveBeenCalledTimes(1)
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file1.log'))
    })
})
