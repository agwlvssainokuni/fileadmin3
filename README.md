FileAdmin3 - ファイル管理
========================

# コマンドライン
```bash
fileadmin.js [options] 設定ファイル...
    --time TIME        基準日時指定 (省略時: システム日時)
    --dry-run          ドライランする
    --[no-]syslog      SYSLOG出力フラグ (省略時: SYSLOG出力する)
    --[no-]console     コンソール出力フラグ (省略時: コンソール出力しない)
```

# 設定ファイル
## 基本構成
```TypeScript
interface FileProcessor {
    process: (time: Date, dryRun: boolean) => boolean;
}
interface FileCollector {
    collect: (time: Date) => string[];
}
```

## 集約アーカイブ作成
複数のファイルを一つのZIPファイルにアーカイブする。
```TypeScript
declare const archive_many_to_one: (label: string, config: {
    basedir: string;                // 処理の基点ディレクトリ。
    collector: FileCollector;       // ZIPアーカイブに含めるファイルの収集条件。
    to_dir: string;                 // ZIPアーカイブの作成先ディレクトリ。
    arcname: (time: Date) => string;    // 作成するZIPアーカイブのファイル名。
    options?: {
        chown?: number[] | number;  // 作成するZIPアーカイブの所有者。
        retainOriginal?: boolean;   // 元ファイルを保持するかどうか。
    };
}) => FileProcessor;
```

## 単体アーカイブ作成
一ファイルあたり一つのZIPファイルにアーカイブする。
```TypeScript
declare const archive_one_to_one: (label: string, config: {
    basedir: string;                // 処理の基点ディレクトリ。
    collector: FileCollector;       // ZIPアーカイブにするファイルの収集条件。
    to_dir: string;                 // ZIPアーカイブの作成先ディレクトリ。
    arcname: (p: string, time: Date) => string; // 対象のファイル名から作成するZIPアーカイブファイル名。
    options?: {
        chown?: number[] | number;  // 作成するZIPアーカイブの所有者。
        retainOriginal?: boolean;   // 元ファイルを保持するかどうか。
    };
}) => FileProcessor;
```

## ファイル退避
ファイルを所定のディレクトリへ退避 (移動) する。
```TypeScript
declare const backup_file: (label: string, config: {
    basedir: string;                // 処理の基点ディレクトリ。
    collector: FileCollector;       // 退避するファイルの収集条件。
    to_dir: string;                 // ファイルの退避先ディレクトリ。
}) => FileProcessor;
```

## ファイル削除
ファイルを削除する。
```TypeScript
declare const cleanup_file: (label: string, config: {
    basedir: string;                // 処理の基点ディレクトリ。
    collector: FileCollector;       // 削除するファイルの収集条件。
}) => FileProcessor;
```

## ファイルの収集条件
### 世代数条件
指定した並び順に並べ、所定の世代数分を末尾から除外したものを対象とする。(古いものを抽出)
```TypeScript
declare const collect_by_generation: (config: {
    pattern: string[];                  // 収集対象のパスをワイルドカードで指定。
    extra_cond: (f: string) => boolean; // patternで抽出したファイルの追加抽出条件。省略可。
    comparator: (a: string, b: string) => number;   // 抽出したファイル名の並び順。patternを複数指定した場合は要素ごとに整列する。省略可。
    generation: number;                 // comparator順に並べて末尾generation件を除いたものを対象とする (古いものを抽出)。
}) => FileCollector;
```

### 閾値条件
実行日時から閾値文字列を生成。ファイル名の日時部分が閾値よりも小(<)のものを対象とする。(古いものを抽出)
```TypeScript
declare const collect_by_threshold: (config: {
    pattern: string[];                  // 収集対象のパスをワイルドカードで指定。
    extra_cond: (f: string) => boolean; // patternで抽出したファイルの追加抽出条件。省略可。
    comparator: (a: string, b: string) => number;   // 抽出したファイル名の並び順。patternを複数指定した場合は要素ごとに整列する。省略可。
    slicer: (f: string) => string;      // 抽出したファイル名から閾値と比較するための文字列を生成する。
    threshold: (time: Date) => string;  // 実行日時から閾値文字列を生成する。この閾値文字列よりも小(<)のものを対象とする (古いものを抽出)。
}) => FileCollector;
```

# ランタイム構成
設定ファイル(DSL)の作成およびファイル管理機能の実行に必要なランタイム構成を runtime/ 配下に用意。

## 内訳
* ファイル管理機能の実行
  * fileadmin.js
  * package.json
    * 実行時に使用するライブラリを dependencies として指定。
* 設定ファイル(DSL)の作成
  * package.json
    * 設定ファイル(DSL)の作成時に使用するライブラリを devDependencies として指定。
  * global.d.ts
    * 設定ファイル(DSL)を TypeScript で記述する際に参照する型定義。
  * tsconfig.json
    * TypeScript で記述した設定ファイル(DSL)を CommonJS へコンパイルするための設定。

## 依存ライブラリ
ランタイム構成の依存ライブラリとして以下を設定。
* dependencies
  * unix-dgram
    * winston-syslog の推移的依存ライブラリ。
    * ネイティブモジュール (unix_dgram.node) はバンドルできないため external として用意する。
  * date-fns
    * 設定ファイル(DSL)で使用できる日時文字列操作ライブラリ。
* devDependencies
  * typescript
    * TypeScript コンパイラ。
    * TypeScript で記述した設定ファイル(DSL)を CommonJS へコンパイルする。
  * @types/node
    * Node.js の型定義。
    * 設定ファイル(DSL)を TypeScript で記述する際に参照する型定義。
