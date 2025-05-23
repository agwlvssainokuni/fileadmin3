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
import {lightFormat, parse} from 'date-fns'
import {readFileSync} from 'fs'
import {dirname, resolve} from 'path'
import {createContext, runInContext} from 'vm'
import {
    archive_many_to_one,
    archive_one_to_one,
    backup_file,
    cleanup_file,
    collect_by_generation,
    collect_by_threshold,
    FileCollector,
    FileProcessor,
} from './file_admin/dsl'
import {enableLogging} from './file_admin/logger'

export const file_admin = (args: string[]): boolean => {

    // (1) コマンドラインオプションを解析する。
    const command = new Command()
    command
        .option('-t, --time <time>', '基準日時指定 (省略時: システム日時)',
            lightFormat(new Date(), 'yyyyMMddHHmmss'))
        .option('-d, --dry-run', 'ドライランする', false)
        .option('-s, --syslog', 'SYSLOG出力する', true)
        .option('--no-syslog', 'SYSLOG出力しない')
        .option('-c, --console', 'コンソール出力する', false)
        .option('--no-console', 'コンソール出力しない')
        .option('-h, --help', 'ヘルプを表示する', false)
        .argument('[file...]', '設定ファイル(DSLで記述)')
        .parse(args)

    // --help ヘルプを表示する。
    const options = command.opts()
    if (options.help) {
        command.outputHelp()
        return true
    }

    // --[no-]console, --[no-]syslog ログ出力設定
    enableLogging({
        console: options.console,
        syslog: options.syslog,
    })

    // --time 規準日時を設定する。
    const time = parseTime(options.time, new Date())

    // (2) 設定ファイル(DSL)を解析する。
    const configurations: FileProcessor[] = []
    const allowedToRequire: string[] = [
        'path',
        'date-fns',
    ]
    const context = createDslContext(configurations, allowedToRequire)
    for (const f of command.args) {
        const file = resolve(f)
        const script = readFileSync(file, {encoding: 'utf8'})
        context.__dirname = dirname(file)
        context.__filename = file
        runInContext(script, context, {filename: file})
    }

    // (3) 設定内容に沿ってファイル管理処理を実行する。
    let ok: boolean = true
    for (const config of configurations) {
        if (!config.process(time, options.dryRun)) {
            ok = false
        }
    }

    return ok
}

const parseTime = (time: string, referenceDate: Date = new Date()): Date => {
    const formats = [
        'yyyyMMddHHmmss',
        'yyyyMMddHHmm',
        'yyyyMMddHH',
        'yyyyMMdd',
        'yyMMdd',
        'MMdd',
    ]
    const formatStr = formats.find(f => f.length === time.length)
    return parse(time, formatStr ?? 'yyyyMMddHHmmss', referenceDate)
}

const createDslContext = (configurations: FileProcessor[], allowedToRequire: string[]) =>
    createContext({
        console: console,
        __dirname: '',
        __filename: '',
        exports: {},
        require: (id: string): any => {
            if (allowedToRequire.indexOf(id) === -1) {
                return undefined
            }
            return require(id)
        },
        archive_many_to_one: (
            label: string,
            config: {
                basedir: string,
                collector: FileCollector,
                to_dir: string,
                arcname: (time: Date) => string,
                options?: { owner?: number[] | number, retainOriginal?: boolean },
            },
        ): FileProcessor => {
            const p = archive_many_to_one(label, config)
            configurations.push(p)
            return p
        },
        archive_one_to_one: (
            label: string,
            config: {
                basedir: string,
                collector: any,
                to_dir: string,
                arcname: (p: string, time: Date) => string,
                options?: { owner?: number[] | number, retainOriginal?: boolean },
            },
        ): FileProcessor => {
            const p = archive_one_to_one(label, config)
            configurations.push(p)
            return p
        },
        backup_file: (
            label: string,
            config: {
                basedir: string,
                collector: any,
                to_dir: string,
            },
        ): FileProcessor => {
            const p = backup_file(label, config)
            configurations.push(p)
            return p
        },
        cleanup_file: (
            label: string,
            config: {
                basedir: string,
                collector: any,
            },
        ): FileProcessor => {
            const p = cleanup_file(label, config)
            configurations.push(p)
            return p
        },
        collect_by_generation: (
            config: {
                pattern: string[],
                extra_cond: (f: string) => boolean,
                comparator: (a: string, b: string) => number,
                generation: number,
            }
        ): FileCollector => {
            return collect_by_generation(config)
        },
        collect_by_threshold: (
            config: {
                pattern: string[],
                extra_cond: (f: string) => boolean,
                comparator: (a: string, b: string) => number,
                slicer: (f: string) => string,
                threshold: (time: Date) => string,
            }
        ): FileCollector => {
            return collect_by_threshold(config)
        }
    })
