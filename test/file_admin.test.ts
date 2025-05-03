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

vi.mock('fs')

describe('file_admin', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 0 when help option is provided', () => {
        const mockArgs = ['node', 'fileadmin.js', '--help']
        const result = file_admin(mockArgs)
        expect(result).toBe(0)
    })

    it('should parse DSL files and execute configurations', () => {
        // 事前条件
        const mockArgs = ['node', 'fileadmin.js', 'test.dsl']
        const mockScript = `
            backup_file('test-label', {
                basedir: '.',
                collector: {
                    validate: () => true,
                    collect: () => ['file1.log', 'file2.log'],
                },
                to_dir: './backup',
            })
        `
        vi.mocked(readFileSync).mockReturnValue(mockScript)

        // 実行
        const result = file_admin(mockArgs)

        // 検証
        expect(result).toBe(0)
        expect(readFileSync).toHaveBeenCalledWith(resolve('test.dsl'), {encoding: 'utf8'})
    })

    it('should return 0 if any configuration validation succeeds', () => {
        // 事前条件
        const mockArgs = ['node', 'fileadmin.js', '--validate', 'test.dsl']
        const mockScript = `
            backup_file('test-label', {
                basedir: '.',
                collector: {
                    validate: () => false,
                    collect: () => [],
                },
                to_dir: './backup',
            })
        `
        vi.mocked(readFileSync).mockReturnValue(mockScript)

        // 実行
        const result = file_admin(mockArgs)

        // 検証
        expect(result).toBe(0)
    })

    it('should return 0 if any configuration process succeeds', () => {
        // 事前条件
        const mockArgs = ['node', 'fileadmin.js', 'test.dsl']
        const mockScript = `
            backup_file('test-label', {
                basedir: '.',
                collector: {
                    validate: () => true,
                    collect: () => ['file1.log'],
                },
                to_dir: './backup',
            })
        `
        vi.mocked(readFileSync).mockReturnValue(mockScript)

        // 実行
        const result = file_admin(mockArgs)

        // 検証
        expect(result).toBe(0)
    })
})
