"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const date_fns_1 = require("date-fns");
archive_one_to_one('一対一アーカイブ', {
    basedir: `${__dirname}/0file`,
    collector: collect_by_generation({
        pattern: ['**/foreach_*.txt'],
        extra_cond: (a) => !!a.match(/_(\d{14})\.txt$/),
    }),
    to_dir: `${__dirname}/1arch`,
    arcname: (a, _) => `${(0, path_1.basename)(a, '.txt')}.zip`,
});
archive_many_to_one('集約アーカイブ', {
    basedir: `${__dirname}/0file`,
    collector: collect_by_generation({
        pattern: ['**/aggregate_*.txt'],
    }),
    to_dir: `${__dirname}/1arch`,
    arcname: (time) => `aggregate_${(0, date_fns_1.lightFormat)(time, 'yyyyMMddHHmmss')}.zip`,
});
backup_file('退避テスト', {
    basedir: `${__dirname}/1arch`,
    collector: collect_by_threshold({
        pattern: ['foreach_*.zip', 'aggregate_*.zip'],
        extra_cond: (a) => !!a.match(/_(\d{14})\.zip$/),
        slicer: (a) => a.match(/_(\d{14})\.zip$/)?.[1],
        threshold: (time) => (0, date_fns_1.lightFormat)((0, date_fns_1.addDays)(time, -1), 'yyyyMMddHHmmss'),
    }),
    to_dir: `${__dirname}/2back`,
});
cleanup_file('削除テスト', {
    basedir: `${__dirname}/2back`,
    collector: collect_by_threshold({
        pattern: ['foreach_*.zip', 'aggregate_*.zip'],
        extra_cond: (a) => !!a.match(/_(\d{14})\.zip$/),
        slicer: (a) => a.match(/_(\d{14})\.zip$/)?.[1],
        threshold: (time) => (0, date_fns_1.lightFormat)((0, date_fns_1.addDays)(time, -2), 'yyyyMMddHHmmss'),
    }),
});
