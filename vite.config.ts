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

import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
    build: {
        // https://vite.dev/config/build-options.html#build-lib
        lib: {
            entry: './src/index.ts',
            formats: ['es', 'cjs'],
            fileName: 'fileadmin'
        },
        // https://vite.dev/config/build-options.html#build-sourcemap
        sourcemap: true,
        // https://vite.dev/config/build-options.html#build-rollupoptions
        rollupOptions: {
            // https://github.com/vitejs/vite/issues/7821
            external: [
                'node:child_process',
                'node:events',
                'node:fs',
                'node:os',
                'node:path',
                'node:process',
                'buffer',
                'crypto',
                'dgram',
                'events',
                'fs',
                'http',
                'https',
                'net',
                'os',
                'path',
                'stream',
                'tls',
                'util',
                'vm',
                'zlib',
                // ネイティブライブラリを含むためバンドルしない
                'unix-dgram',
            ],
        }
    }
})
