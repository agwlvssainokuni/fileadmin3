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

import {describe, expect, it} from 'vitest'
import {
    archive_many_to_one,
    archive_one_to_one,
    backup_file,
    cleanup_file,
    collect_by_generation,
    collect_by_threshold,
} from '../../src/file_admin/dsl'
import {ArchiveManyToOne} from '../../src/file_admin/archive_many_to_one'
import {ArchiveOneToOne} from '../../src/file_admin/archive_one_to_one'
import {BackupFile} from '../../src/file_admin/backup_file'
import {CleanupFile} from '../../src/file_admin/cleanup_file'
import {CollectByGeneration} from '../../src/file_admin/collect_by_generation'
import {CollectByThreshold} from '../../src/file_admin/collect_by_threshold'

describe('dsl', () => {
    it('archive_many_to_one should create an ArchiveManyToOne instance', () => {
        const mockCollector = {collect: () => []}
        const result = archive_many_to_one('test-label', {
            basedir: '/base/dir',
            collector: mockCollector,
            to_dir: '/to/dir',
            arcname: (time) => `archive-${time.toISOString()}.zip`,
            options: {chown: [1000, 1000], retainOriginal: false},
        })
        expect(result).toBeInstanceOf(ArchiveManyToOne)
    })

    it('archive_one_to_one should create an ArchiveOneToOne instance', () => {
        const mockCollector = {collect: () => []}
        const result = archive_one_to_one('test-label', {
            basedir: '/base/dir',
            collector: mockCollector,
            to_dir: '/to/dir',
            arcname: (p, time) => `${p}-${time.toISOString()}.zip`,
            options: {chown: 1000, retainOriginal: true},
        })
        expect(result).toBeInstanceOf(ArchiveOneToOne)
    })

    it('backup_file should create a BackupFile instance', () => {
        const mockCollector = {collect: () => []}
        const result = backup_file('test-label', {
            basedir: '/base/dir',
            collector: mockCollector,
            to_dir: '/to/dir',
        })
        expect(result).toBeInstanceOf(BackupFile)
    })

    it('cleanup_file should create a CleanupFile instance', () => {
        const mockCollector = {collect: () => []}
        const result = cleanup_file('test-label', {
            basedir: '/base/dir',
            collector: mockCollector,
        })
        expect(result).toBeInstanceOf(CleanupFile)
    })

    it('collect_by_generation should create a CollectByGeneration instance', () => {
        const result = collect_by_generation({
            pattern: ['*.log'],
            extra_cond: (f) => f.includes('error'),
            comparator: (a, b) => a.localeCompare(b),
            generation: 3,
        })
        expect(result).toBeInstanceOf(CollectByGeneration)
    })

    it('collect_by_threshold should create a CollectByThreshold instance', () => {
        const result = collect_by_threshold({
            pattern: ['*.log'],
            extra_cond: (f) => f.includes('error'),
            comparator: (a, b) => a.localeCompare(b),
            slicer: (f) => f.split('-')[1],
            threshold: (time) => time.toISOString(),
        })
        expect(result).toBeInstanceOf(CollectByThreshold)
    })
})
