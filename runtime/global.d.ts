interface FileProcessor {
    process: (time: Date, dryRun: boolean) => boolean;
}
interface FileCollector {
    collect: (time: Date) => string[];
}
declare const archive_many_to_one: (label: string, config: {
    basedir: string;
    collector: FileCollector;
    to_dir: string;
    arcname: (time: Date) => string;
    options?: {
        chown?: number[] | number;
        retainOriginal?: boolean;
    };
}) => FileProcessor;
declare const archive_one_to_one: (label: string, config: {
    basedir: string;
    collector: FileCollector;
    to_dir: string;
    arcname: (p: string, time: Date) => string;
    options?: {
        chown?: number[] | number;
        retainOriginal?: boolean;
    };
}) => FileProcessor;
declare const backup_file: (label: string, config: {
    basedir: string;
    collector: FileCollector;
    to_dir: string;
}) => FileProcessor;
declare const cleanup_file: (label: string, config: {
    basedir: string;
    collector: FileCollector;
}) => FileProcessor;
declare const collect_by_generation: (config: {
    pattern: string[];
    extra_cond?: (f: string) => boolean;
    comparator?: (a: string, b: string) => number;
    generation?: number;
}) => FileCollector;
declare const collect_by_threshold: (config: {
    pattern: string[];
    extra_cond?: (f: string) => boolean;
    comparator?: (a: string, b: string) => number;
    slicer?: (f: string) => string;
    threshold?: (time: Date) => string;
}) => FileCollector;
