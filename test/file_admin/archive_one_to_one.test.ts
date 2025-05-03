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
import {ArchiveOneToOne} from '../../src/file_admin/archive_one_to_one'
import {FileCollector} from '../../src/file_admin/dsl'

vi.mock('fs')
const mockWriteFileSync = vi.mocked(writeFileSync)
const mockUnlinkSync = vi.mocked(unlinkSync)
const mockChownSync = vi.mocked(chownSync)

vi.mock('adm-zip', () => ({
    default: vi.fn(() => ({
        addLocalFile: mockAddLocalFile,
        toBuffer: mockToBuffer,
    })),
}))
const MockAdmZip = vi.mocked(AdmZip)
const mockAddLocalFile = vi.fn()
const mockToBuffer = vi.fn(() => Buffer.from('mock-zip-content'))

describe('ArchiveOneToOne', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('process should archive files and delete originals', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }
        const instance = new ArchiveOneToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (file) => `${file}.zip`,
            [1234, 5678],
            false
        )

        // 実行
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(true)
        expect(MockAdmZip).toHaveBeenCalledTimes(2)
        expect(mockAddLocalFile).toHaveBeenCalledTimes(2)
        expect(mockAddLocalFile).toHaveBeenCalledWith('file1.log')
        expect(mockAddLocalFile).toHaveBeenCalledWith('file2.log')
        expect(mockToBuffer).toHaveBeenCalledTimes(2)
        expect(mockWriteFileSync).toHaveBeenCalledTimes(2)
        expect(mockWriteFileSync).toHaveBeenCalledWith(
            resolve('./archive/file1.log.zip'),
            Buffer.from('mock-zip-content')
        )
        expect(mockWriteFileSync).toHaveBeenCalledWith(
            resolve('./archive/file2.log.zip'),
            Buffer.from('mock-zip-content')
        )
        expect(mockUnlinkSync).toHaveBeenCalledTimes(2)
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file1.log'))
        expect(mockUnlinkSync).toHaveBeenCalledWith(resolve('file2.log'))
        expect(mockChownSync).toHaveBeenCalledTimes(2)
        expect(mockChownSync).toHaveBeenCalledWith(resolve('./archive/file1.log.zip'), 1234, 5678)
        expect(mockChownSync).toHaveBeenCalledWith(resolve('./archive/file2.log.zip'), 1234, 5678)
    })

    it('process should not delete originals in retainOriginal mode', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }
        const instance = new ArchiveOneToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (file) => `${file}.zip`,
            [1234, 5678],
            true
        )

        // 実行
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(true)
        expect(MockAdmZip).toHaveBeenCalledTimes(2)
        expect(mockAddLocalFile).toHaveBeenCalledTimes(2)
        expect(mockToBuffer).toHaveBeenCalledTimes(2)
        expect(mockWriteFileSync).toHaveBeenCalledTimes(2)
        expect(mockUnlinkSync).not.toHaveBeenCalled()
        expect(mockChownSync).toHaveBeenCalledTimes(2)
    })

    it('process should handle dryRun mode without making changes', () => {
        // 事前条件
        const collector: FileCollector = {
            collect: () => ['file1.log', 'file2.log'],
        }
        const instance = new ArchiveOneToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (file) => `${file}.zip`,
            [1234, 5678],
            false
        )

        // 実行
        const result = instance.process(new Date(), true)

        // 検証
        expect(result).toBe(true)
        expect(MockAdmZip).not.toHaveBeenCalled()
        expect(mockAddLocalFile).not.toHaveBeenCalled()
        expect(mockToBuffer).not.toHaveBeenCalled()
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
            collect: () => ['file1.log', 'file2.log'],
        }
        const instance = new ArchiveOneToOne(
            'test-label',
            '.',
            collector,
            './archive',
            (file) => `${file}.zip`,
            [1234, 5678],
            false
        )

        // 実行
        const result = instance.process(new Date(), false)

        // 検証
        expect(result).toBe(false)
        expect(MockAdmZip).toHaveBeenCalledTimes(1)
        expect(mockAddLocalFile).toHaveBeenCalledTimes(1)
        expect(mockToBuffer).toHaveBeenCalledTimes(1)
        expect(mockWriteFileSync).toHaveBeenCalledTimes(1)
        expect(mockUnlinkSync).not.toHaveBeenCalled()
        expect(mockChownSync).not.toHaveBeenCalled()
    })
})
