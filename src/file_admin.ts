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

import {Command} from 'commander'
import {lightFormat} from 'date-fns'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import {ArchiveManyToOne} from './file_admin/archive_many_to_one'
import {ArchiveOneToOne} from './file_admin/archive_one_to_one'
import {BackupFile} from './file_admin/backup_file'
import {CleanupFile} from './file_admin/cleanup_file'
import {CollectByGeneration} from './file_admin/collect_by_generation'
import {CollectByThreshold} from './file_admin/collect_by_threshold'
import {FileCollector, FileProcessor} from './file_admin/interface'

export const file_admin = (args: string[]): number => {

    const command = new Command()
    command
        .option('-t, --time <time', '基準日時指定 (省略時: システム日時)',
            lightFormat(new Date(), 'yyyyMMddHHmmss'))
        .option('-v, --validate', '設定チェックする', false)
        .option('--no-validate', '設定チェックなし')
        .option('-d, --dry-run', 'ドライランする', false)
        .option('--no-dry-run', 'ドライランなし')
        .option('-s, --syslog', 'SYSLOG出力する', true)
        .option('--no-syslog', 'SYSLOG出力しない')
        .option('-c, --console', 'コンソール出力する', false)
        .option('--no-console', 'コンソール出力しない')
        .option('-h, --help', 'ヘルプを表示する', false)
        .argument('[設定ファイル...]', '設定ファイル')
        .parse(args)

    const options = command.opts()
    if (options.help) {
        command.outputHelp()
        return 0
    }

    console.log('time = ', options.time)
    console.log('validate = ', options.validate)
    console.log('dry-run = ', options.dryRun)
    console.log('syslog = ', options.syslog)
    console.log('console = ', options.console)

    const configurations: FileProcessor[] = []
    const allowedToRequire: string[] = [
        'path',
    ]
    const context = vm.createContext({
        console: console,
        require: (id: string): any => {
            if (allowedToRequire.indexOf(id) === -1) {
                return undefined
            }
            return require(id)
        },
        __dirname: __dirname,
        __filename: __dirname,
        archive_many_to_one: (
            label: string,
            config: {
                basedir: string,
                collector: FileCollector,
                to_dir: string,
                arcname: string,
                options?: { owner?: string },
            },
        ): void => {
            configurations.push(new ArchiveManyToOne(
                label,
                config.basedir,
                config.collector,
                config.to_dir,
                config.arcname,
                config.options?.owner,
            ))
        },
        archive_one_to_one: (
            label: string,
            config: {
                basedir: string,
                collector: any,
                to_dir: string,
                arcname: (p: string) => string,
                options?: { owner?: string },
            },
        ): void => {
            configurations.push(new ArchiveOneToOne(
                label,
                config.basedir,
                config.collector,
                config.to_dir,
                config.arcname,
                config.options?.owner,
            ))
        },
        backup_file: (
            label: string,
            config: {
                basedir: string,
                collector: any,
                to_dir: string,
            },
        ): void => {
            configurations.push(new BackupFile(
                label,
                config.basedir,
                config.collector,
                config.to_dir,
            ))
        },
        cleanup_file: (
            label: string,
            config: {
                basedir: string,
                collector: any,
            },
        ): void => {
            configurations.push(new CleanupFile(
                label,
                config.basedir,
                config.collector,
            ))
        },
        collect_by_generation: (
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
        },
        collect_by_threshold: (
            config: {
                pattern: string[],
                extra_cond: (f: string) => boolean,
                comparator: (a: string, b: string) => number,
                slicer: (f: string) => string,
                threshold: number,
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
    })

    for (const f of command.args) {
        const file = path.resolve(f)
        const script = fs.readFileSync(file, {encoding: 'utf8'})
        context.__dirname = path.dirname(file)
        context.__filename = file
        vm.runInContext(script, context, {filename: file})
    }

    let ok: boolean = true
    if (options.validate) {
        for (const config of configurations) {
            if (!config.validate()) {
                ok = false
            }
        }
    } else {
        for (const config of configurations) {
            if (!config.process(options.time, options.dryRun)) {
                ok = false
            }
        }
    }

    if (ok) {
        return 0
    } else {
        return 1
    }
}
