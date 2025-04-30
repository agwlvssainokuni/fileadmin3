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

import {ArchiveManyToOne} from './archive_many_to_one'
import {ArchiveOneToOne} from './archive_one_to_one'
import {BackupFile} from './backup_file'
import {CleanupFile} from './cleanup_file'
import {CollectByGeneration} from './collect_by_generation'
import {CollectByThreshold} from './collect_by_threshold'

export interface FileProcessor {
    process: (time: Date, dryRun: boolean) => boolean
    validate: () => boolean
}

export interface FileCollector {
    collect: (time: Date) => string[]
    validate: () => boolean
}

export const archive_many_to_one = (
    label: string,
    config: {
        basedir: string,
        collector: FileCollector,
        to_dir: string,
        arcname: (time: Date) => string,
        options?: { owner?: string },
    },
): FileProcessor => {
    return new ArchiveManyToOne(
        label,
        config.basedir,
        config.collector,
        config.to_dir,
        config.arcname,
        config.options?.owner,
    )
}

export const archive_one_to_one = (
    label: string,
    config: {
        basedir: string,
        collector: any,
        to_dir: string,
        arcname: (p: string, time: Date) => string,
        options?: { owner?: string },
    },
): FileProcessor => {
    return new ArchiveOneToOne(
        label,
        config.basedir,
        config.collector,
        config.to_dir,
        config.arcname,
        config.options?.owner,
    )
}

export const backup_file = (
    label: string,
    config: {
        basedir: string,
        collector: any,
        to_dir: string,
    },
): FileProcessor => {
    return new BackupFile(
        label,
        config.basedir,
        config.collector,
        config.to_dir,
    )
}

export const cleanup_file = (
    label: string,
    config: {
        basedir: string,
        collector: any,
    },
): FileProcessor => {
    return new CleanupFile(
        label,
        config.basedir,
        config.collector,
    )
}

export const collect_by_generation = (
    config: {
        pattern: string[],
        extra_cond: (f: string) => boolean,
        comparator: (a: string, b: string) => number,
        generation: number,
    }
): FileCollector => {
    return new CollectByGeneration(
        config.pattern,
        config.extra_cond,
        config.comparator,
        config.generation,
    )
}

export const collect_by_threshold = (
    config: {
        pattern: string[],
        extra_cond: (f: string) => boolean,
        comparator: (a: string, b: string) => number,
        slicer: (f: string) => string,
        threshold: (time: Date) => string,
    }
): FileCollector => {
    return new CollectByThreshold(
        config.pattern,
        config.extra_cond,
        config.comparator,
        config.slicer,
        config.threshold,
    )
}
