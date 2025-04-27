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

const {basename} = require('path')

archive_one_to_one("一対一アーカイブ", {
    basedir: `${__dirname}/0file`,
    collector: collect_by_generation(
        "foreach_*.txt",
        (a) => /_(\d{14})\.txt\z/.match(a)
    ),
    to_dir: `${__dirname}/1arch`,
    arcname: (a) => basename(a, ".txt") + ".zip",
})

archive_many_to_one("集約アーカイブ", {
    basedir: `${__dirname}/0file`,
    collector: collect_by_generation(
        "aggregate_*.txt",
    ),
    to_dir: `${__dirname}/1arch`,
    arcname: "aggregate_%Y%m%d%H%M%S.zip",
})

backup_file("退避テスト", {
    basedir: `${__dirname}/1arch`,
    collector: collect_by_threshold(
        ["foreach_*.zip", "aggregate_*.zip"],
        (a) => /_(\d{14})\.zip\z/.match(a) ? $1 : null,
    ),
    to_dir: `${__dirname}/2back`,
})

cleanup_file("削除テスト", {
    basedir: `${__dirname}/2back`,
    collector: collect_by_threshold(
        ["foreach_*.zip", "aggregate_*.zip"],
        (a) => /_(\d{14})\.zip\z/.match(a) ? $1 : null,
    ),
})
