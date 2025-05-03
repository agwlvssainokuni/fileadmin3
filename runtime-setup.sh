#!/bin/bash -xe
#
#  Copyright 2025 agwlvssainokuni
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

basedir=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)

# (1) ビルド
npm install
npm run build
npm run build.d

# (2) 実行ファイルをコピー
cp -p "${basedir}/dist/fileadmin.js" "${basedir}/runtime/"
chmod +x "${basedir}/runtime/fileadmin.js"

# (3) 型定義ファイルをコピー
sed -e 's/^export //' "${basedir}/src/file_admin/dsl.d.ts" > "${basedir}/runtime/global.d.ts"
