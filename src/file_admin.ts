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
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
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

export const file_admin = (args: string[]): number => {

    // (1) コマンドラインオプションを解析する。
    const command = new Command()
    command
        .option('-t, --time <time>', '基準日時指定 (省略時: システム日時)',
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

    // --help ヘルプを表示する。
    const options = command.opts()
    if (options.help) {
        command.outputHelp()
        return 0
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
    const context = createContext(configurations, allowedToRequire)
    for (const f of command.args) {
        const file = path.resolve(f)
        const script = fs.readFileSync(file, {encoding: 'utf8'})
        context.__dirname = path.dirname(file)
        context.__filename = file
        vm.runInContext(script, context, {filename: file})
    }

    // (3) ファイル管理処理実行。
    let ok: boolean = true
    if (options.validate) {
        // (3)-1 設定内容のバリデーションを実行する。
        for (const config of configurations) {
            if (!config.validate()) {
                ok = false
            }
        }
    } else {
        // (3)-2 設定内容に沿ってファイル管理処理を実行する。
        for (const config of configurations) {
            if (!config.process(time, options.dryRun)) {
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

const createContext = (configurations: FileProcessor[], allowedToRequire: string[]) =>
    vm.createContext({
        console: console,
        __dirname: __dirname,
        __filename: __dirname,
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
                arcname: (p: string) => string,
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
