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
export interface FileProcessor {
    process: (time: Date, dryRun: boolean) => boolean;
}
export interface FileCollector {
    collect: (time: Date) => string[];
}
```

## 集約アーカイブ作成
複数のファイルを一つのZIPファイルにアーカイブする。
```TypeScript
export declare const archive_many_to_one: (label: string, config: {
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
export declare const archive_one_to_one: (label: string, config: {
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
export declare const backup_file: (label: string, config: {
    basedir: string;                // 処理の基点ディレクトリ。
    collector: FileCollector;       // 退避するファイルの収集条件。
    to_dir: string;                 // ファイルの退避先ディレクトリ。
}) => FileProcessor;
```

## ファイル削除
ファイルを削除する。
```TypeScript
export declare const cleanup_file: (label: string, config: {
    basedir: string;                // 処理の基点ディレクトリ。
    collector: FileCollector;       // 削除するファイルの収集条件。
}) => FileProcessor;
```

## ファイルの収集条件
### 世代数条件
指定した並び順に並べ、所定の世代数分を末尾から除外したものを対象とする。(古いものを抽出)
```TypeScript
export declare const collect_by_generation: (config: {
    pattern: string[];                  // 収集対象のパスをワイルドカードで指定。
    extra_cond: (f: string) => boolean; // patternで抽出したファイルの追加抽出条件。省略可。
    comparator: (a: string, b: string) => number;   // 抽出したファイル名の並び順。patternを複数指定した場合は要素ごとに整列する。省略可。
    generation: number;                 // comparator順に並べて末尾generation件を除いたものを対象とする (古いものを抽出)。
}) => FileCollector;
```

### 閾値条件
実行日時から閾値文字列を生成。ファイル名の日時部分が閾値よりも小(<)のものを対象とする。(古いものを抽出)
```TypeScript
export declare const collect_by_threshold: (config: {
    pattern: string[];                  // 収集対象のパスをワイルドカードで指定。
    extra_cond: (f: string) => boolean; // patternで抽出したファイルの追加抽出条件。省略可。
    comparator: (a: string, b: string) => number;   // 抽出したファイル名の並び順。patternを複数指定した場合は要素ごとに整列する。省略可。
    slicer: (f: string) => string;      // 抽出したファイル名から閾値と比較するための文字列を生成する。
    threshold: (time: Date) => string;  // 実行日時から閾値文字列を生成する。この閾値文字列よりも小(<)のものを対象とする (古いものを抽出)。
}) => FileCollector;
```
