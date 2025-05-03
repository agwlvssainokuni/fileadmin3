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
import {renameSync} from 'fs'
import {join, resolve} from 'path'
import {BackupFile} from '../../src/file_admin/backup_file'
import {FileCollector} from '../../src/file_admin/dsl'

vi.mock('fs')
const mockRenameSync = vi.mocked(renameSync)

describe('BackupFile', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('process should rename files based on collector results', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log', 'file3.log'],
        }

        // 実行
        const instance = new BackupFile('test-label', '.', collector, './backup')
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(true)
        expect(mockRenameSync).toHaveBeenCalledTimes(3)
        expect(mockRenameSync).toHaveBeenCalledWith(
            resolve('file1.log'),
            join(resolve('./backup'), 'file1.log')
        )
        expect(mockRenameSync).toHaveBeenCalledWith(
            resolve('file2.log'),
            join(resolve('./backup'), 'file2.log')
        )
        expect(mockRenameSync).toHaveBeenCalledWith(
            resolve('file3.log'),
            join(resolve('./backup'), 'file3.log')
        )
    })

    it('process should not rename files in dryRun mode', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }

        // 実行
        const instance = new BackupFile('test-label', '.', collector, './backup')
        const result = instance.process(new Date(), true)

        // 検証
        expect(result).toBe(true)
        expect(mockRenameSync).not.toHaveBeenCalled()
    })

    it('process should handle empty collector results gracefully', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => [],
        }

        // 実行
        const instance = new BackupFile('test-label', '.', collector, './backup')
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(true)
        expect(mockRenameSync).not.toHaveBeenCalled()
    })

    it('process should return false if renameSync throws an error', () => {
        // 事前条件
        mockRenameSync.mockImplementation(() => {
            throw new Error('rename error')
        })
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }

        // 実行
        const instance = new BackupFile('test-label', '.', collector, './backup')
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(false)
        expect(mockRenameSync).toHaveBeenCalledTimes(1)
        expect(mockRenameSync).toHaveBeenCalledWith(
            resolve('file1.log'),
            join(resolve('./backup'), 'file1.log')
        )
    })
})
