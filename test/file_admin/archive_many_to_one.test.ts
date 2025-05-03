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
import {chownSync, unlinkSync, writeFileSync} from 'fs'
import {resolve} from 'path'
import AdmZip from 'adm-zip'
import {ArchiveManyToOne} from '../../src/file_admin/archive_many_to_one'
import {FileCollector} from '../../src/file_admin/dsl'

vi.mock('fs')
vi.mock('adm-zip', () => ({
    default: vi.fn().mockImplementation(() => {
        return {
            addLocalFile: vi.fn(),
            toBuffer: vi.fn(() => Buffer.from('mock-zip-content')),
        }
    }),
}))
const mockWriteFileSync = vi.mocked(writeFileSync)
const mockUnlinkSync = vi.mocked(unlinkSync)
const mockChownSync = vi.mocked(chownSync)
const MockAdmZip = vi.mocked(AdmZip)

describe('ArchiveManyToOne', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('process should create a zip file and delete originals', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }
        const instance = new ArchiveManyToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (time) => `archive-${time.toISOString()}.zip`,
            [1234, 5678],
            false
        )

        // 実行
        const time = new Date()
        const result = instance.process(time, false)

        // 検証
        expect(result).toBe(true)
        expect(MockAdmZip).toHaveBeenCalledTimes(1)
        expect(mockWriteFileSync).toHaveBeenCalledWith(
            resolve(`./archive/archive-${time.toISOString()}.zip`),
            Buffer.from('mock-zip-content')
        )
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file1.log'))
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file2.log'))
        expect(mockChownSync).toHaveBeenCalledWith(resolve(`./archive/archive-${time.toISOString()}.zip`), 1234, 5678)
    })

    it('process should not delete originals in retainOriginal mode', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log'],
        }
        const instance = new ArchiveManyToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (time) => `archive-${time.toISOString()}.zip`,
            undefined,
            true
        )

        // 実行
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(true)
        expect(mockUnlinkSync).not.toHaveBeenCalled()
    })

    it('process should handle dryRun mode without making changes', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log'],
        }
        const instance = new ArchiveManyToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (time) => `archive-${time.toISOString()}.zip`,
            [1234, 5678],
            false
        )

        // 実行
        const result = instance.process(new Date(), true)

        // 検証
        expect(result).toBe(true)
        expect(MockAdmZip).not.toHaveBeenCalled()
        expect(mockWriteFileSync).not.toHaveBeenCalled()
        expect(mockUnlinkSync).not.toHaveBeenCalled()
        expect(mockChownSync).not.toHaveBeenCalled()
    })

    it('process should return false if an error occurs during archiving', () => {
        // 事前条件
        mockWriteFileSync.mockImplementation(() => {
            throw new Error('write error')
        })
        const collector: FileCollector = {
            collect: () => ['file1.log'],
        }
        const instance = new ArchiveManyToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (time) => `archive-${time.toISOString()}.zip`
        )

        // 実行
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(false)
        expect(mockWriteFileSync).toHaveBeenCalled()
    })
})
