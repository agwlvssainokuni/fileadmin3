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
import {readFileSync} from 'fs'
import {resolve} from 'path'
import {file_admin} from '../src/file_admin'
import {
    archive_many_to_one,
    archive_one_to_one,
    backup_file,
    cleanup_file,
    collect_by_generation,
    collect_by_threshold
} from '../src/file_admin/dsl'

vi.mock('fs')
vi.mock('../src/file_admin/dsl')
const mockArchiveManyToOne = vi.mocked(archive_many_to_one)
const mockArchiveOneToOne = vi.mocked(archive_one_to_one)
const mockBackupFile = vi.mocked(backup_file)
const mockCleanupFile = vi.mocked(cleanup_file)
const mockCollectByGeneration = vi.mocked(collect_by_generation)
const mockCollectByThreshold = vi.mocked(collect_by_threshold)
const mockArchiveManyToOneProsess = vi.fn()
const mockArchiveOneToOneProsess = vi.fn()
const mockBackupFileProcess = vi.fn()
const mockCleanupFileProcess = vi.fn()

describe('file_admin', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockArchiveManyToOne.mockReturnValue({
            process: mockArchiveManyToOneProsess,
        })
        mockArchiveOneToOne.mockReturnValue({
            process: mockArchiveOneToOneProsess,
        })
        mockBackupFile.mockReturnValue({
            process: mockBackupFileProcess,
        })
        mockCleanupFile.mockReturnValue({
            process: mockCleanupFileProcess,
        })
        vi.mocked(readFileSync).mockImplementation((name) => {
            if (name === resolve('test1.dsl')) {
                return mockScript1
            } else if (name === resolve('test2.dsl')) {
                return mockScript2
            } else if (name === resolve('test3.dsl')) {
                return mockScript3
            } else if (name === resolve('test4.dsl')) {
                return mockScript4
            } else {
                throw new Error(`File not found: ${name}`)
            }
        })
    })

    it('--helpオプション', () => {
        const mockArgs = ['node', 'fileadmin.js', '--help']
        const result = file_admin(mockArgs)
        expect(result).toBe(0)
    })

    describe('DSLスクリプトの読み込み', () => {

        it('archive_many_to_one', () => {
            // 事前条件
            const mockArgs = ['node', 'fileadmin.js', 'test1.dsl']
            mockArchiveManyToOneProsess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(0)
            expect(readFileSync).toHaveBeenCalledTimes(1)
            expect(readFileSync).toHaveBeenCalledWith(resolve('test1.dsl'), {encoding: 'utf8'})
            expect(mockArchiveManyToOne).toHaveBeenCalledTimes(1)
            expect(mockArchiveManyToOneProsess).toHaveBeenCalledTimes(1)
            expect(mockArchiveOneToOne).not.toHaveBeenCalled()
            expect(mockArchiveOneToOneProsess).not.toHaveBeenCalled()
            expect(mockBackupFile).not.toHaveBeenCalled()
            expect(mockBackupFileProcess).not.toHaveBeenCalled()
            expect(mockCleanupFile).not.toHaveBeenCalled()
            expect(mockCleanupFileProcess).not.toHaveBeenCalled()
            expect(mockCollectByGeneration).toHaveBeenCalledTimes(1)
            expect(mockCollectByThreshold).not.toHaveBeenCalled()
        })

        it('archive_one_to_one', () => {
            // 事前条件
            const mockArgs = ['node', 'fileadmin.js', 'test2.dsl']
            mockArchiveOneToOneProsess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(0)
            expect(readFileSync).toHaveBeenCalledTimes(1)
            expect(readFileSync).toHaveBeenCalledWith(resolve('test2.dsl'), {encoding: 'utf8'})
            expect(mockArchiveManyToOne).not.toHaveBeenCalled()
            expect(mockArchiveManyToOneProsess).not.toHaveBeenCalled()
            expect(mockArchiveOneToOne).toHaveBeenCalledTimes(1)
            expect(mockArchiveOneToOneProsess).toHaveBeenCalledTimes(1)
            expect(mockBackupFile).not.toHaveBeenCalled()
            expect(mockBackupFileProcess).not.toHaveBeenCalled()
            expect(mockCleanupFile).not.toHaveBeenCalled()
            expect(mockCleanupFileProcess).not.toHaveBeenCalled()
            expect(mockCollectByGeneration).toHaveBeenCalledTimes(1)
            expect(mockCollectByThreshold).not.toHaveBeenCalled()
        })

        it('backup_file', () => {
            // 事前条件
            const mockArgs = ['node', 'fileadmin.js', 'test3.dsl']
            mockBackupFileProcess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(0)
            expect(readFileSync).toHaveBeenCalledTimes(1)
            expect(readFileSync).toHaveBeenCalledWith(resolve('test3.dsl'), {encoding: 'utf8'})
            expect(mockArchiveManyToOne).not.toHaveBeenCalled()
            expect(mockArchiveManyToOneProsess).not.toHaveBeenCalled()
            expect(mockArchiveOneToOne).not.toHaveBeenCalled()
            expect(mockArchiveOneToOneProsess).not.toHaveBeenCalled()
            expect(mockBackupFile).toHaveBeenCalledTimes(1)
            expect(mockBackupFileProcess).toHaveBeenCalledTimes(1)
            expect(mockCleanupFile).not.toHaveBeenCalled()
            expect(mockCleanupFileProcess).not.toHaveBeenCalled()
            expect(mockCollectByGeneration).not.toHaveBeenCalled()
            expect(mockCollectByThreshold).toHaveBeenCalledTimes(1)
        })

        it('cleanup_file', () => {
            // 事前条件
            const mockArgs = ['node', 'fileadmin.js', 'test4.dsl']
            mockCleanupFileProcess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(0)
            expect(readFileSync).toHaveBeenCalledTimes(1)
            expect(readFileSync).toHaveBeenCalledWith(resolve('test4.dsl'), {encoding: 'utf8'})
            expect(mockArchiveManyToOne).not.toHaveBeenCalled()
            expect(mockArchiveManyToOneProsess).not.toHaveBeenCalled()
            expect(mockArchiveOneToOne).not.toHaveBeenCalled()
            expect(mockArchiveOneToOneProsess).not.toHaveBeenCalled()
            expect(mockBackupFile).not.toHaveBeenCalled()
            expect(mockBackupFileProcess).not.toHaveBeenCalled()
            expect(mockCleanupFile).toHaveBeenCalledTimes(1)
            expect(mockCleanupFileProcess).toHaveBeenCalledTimes(1)
            expect(mockCollectByGeneration).not.toHaveBeenCalled()
            expect(mockCollectByThreshold).toHaveBeenCalledTimes(1)
        })
    })

    describe('成否判定', () => {
        const mockArgs = ['node', 'fileadmin.js', 'test1.dsl', 'test2.dsl', 'test3.dsl', 'test4.dsl']

        it('全部OK', () => {
            // 事前条件
            mockArchiveManyToOneProsess.mockReturnValue(true)
            mockArchiveOneToOneProsess.mockReturnValue(true)
            mockBackupFileProcess.mockReturnValue(true)
            mockCleanupFileProcess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(0)
            expect(mockArchiveManyToOneProsess).toHaveBeenCalledTimes(1)
            expect(mockArchiveOneToOne).toHaveBeenCalledTimes(1)
            expect(mockBackupFileProcess).toHaveBeenCalledTimes(1)
            expect(mockCleanupFileProcess).toHaveBeenCalledTimes(1)
        })

        it('archive_many_to_one NG', () => {
            // 事前条件
            mockArchiveManyToOneProsess.mockReturnValue(false)
            mockArchiveOneToOneProsess.mockReturnValue(true)
            mockBackupFileProcess.mockReturnValue(true)
            mockCleanupFileProcess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(1)
            expect(mockArchiveManyToOneProsess).toHaveBeenCalledTimes(1)
            expect(mockArchiveOneToOne).toHaveBeenCalledTimes(1)
            expect(mockBackupFileProcess).toHaveBeenCalledTimes(1)
            expect(mockCleanupFileProcess).toHaveBeenCalledTimes(1)
        })

        it('archive_one_to_one NG', () => {
            // 事前条件
            mockArchiveManyToOneProsess.mockReturnValue(true)
            mockArchiveOneToOneProsess.mockReturnValue(false)
            mockBackupFileProcess.mockReturnValue(true)
            mockCleanupFileProcess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(1)
            expect(mockArchiveManyToOneProsess).toHaveBeenCalledTimes(1)
            expect(mockArchiveOneToOne).toHaveBeenCalledTimes(1)
            expect(mockBackupFileProcess).toHaveBeenCalledTimes(1)
            expect(mockCleanupFileProcess).toHaveBeenCalledTimes(1)
        })

        it('backup_file NG', () => {
            // 事前条件
            mockArchiveManyToOneProsess.mockReturnValue(true)
            mockArchiveOneToOneProsess.mockReturnValue(true)
            mockBackupFileProcess.mockReturnValue(false)
            mockCleanupFileProcess.mockReturnValue(true)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(1)
            expect(mockArchiveManyToOneProsess).toHaveBeenCalledTimes(1)
            expect(mockArchiveOneToOne).toHaveBeenCalledTimes(1)
            expect(mockBackupFileProcess).toHaveBeenCalledTimes(1)
            expect(mockCleanupFileProcess).toHaveBeenCalledTimes(1)
        })

        it('cleanup_file NG', () => {
            // 事前条件
            mockArchiveManyToOneProsess.mockReturnValue(true)
            mockArchiveOneToOneProsess.mockReturnValue(true)
            mockBackupFileProcess.mockReturnValue(true)
            mockCleanupFileProcess.mockReturnValue(false)

            // 実行
            const result = file_admin(mockArgs)

            // 検証
            expect(result).toBe(1)
            expect(mockArchiveManyToOneProsess).toHaveBeenCalledTimes(1)
            expect(mockArchiveOneToOne).toHaveBeenCalledTimes(1)
            expect(mockBackupFileProcess).toHaveBeenCalledTimes(1)
            expect(mockCleanupFileProcess).toHaveBeenCalledTimes(1)
        })
    })

    const mockScript1 = `
        archive_many_to_one('test-label', {
            basedir: '.',
            collector: collect_by_generation({
                pattern: ['file*.log'],
                generation: 5,
            }),
            to_dir: './archive',
            arcname: (time) => 'archive_' + time.toISOString() + '.zip',
        })
    `
    const mockScript2 = `
        archive_one_to_one('test-label', {
            basedir: '.',
            collector: collect_by_generation({
                pattern: ['file*.log'],
                generation: 5,
            }),
            to_dir: './archive',
            arcname: (f) => f + '.zip',
        })
    `
    const mockScript3 = `
        backup_file('test-label', {
            basedir: '.',
            collector: collect_by_threshold({
                pattern: ['*.zip'],
                threshold: (time) => time.toISOString(),
            }),
            to_dir: './backup',
        })
    `
    const mockScript4 = `
        cleanup_file('test-label', {
            basedir: '.',
            collector: collect_by_threshold({
                pattern: ['*.zip'],
                threshold: (time) => time.toISOString(),
            }),
        })
    `
})
