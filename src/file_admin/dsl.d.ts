export interface FileProcessor {
    process: (time: Date, dryRun: boolean) => boolean;
}
export interface FileCollector {
    collect: (time: Date) => string[];
}
export declare const archive_many_to_one: (label: string, config: {
    basedir: string;
    collector: FileCollector;
    to_dir: string;
    arcname: (time: Date) => string;
    options?: {
        chown?: number[] | number;
        retainOriginal?: boolean;
    };
}) => FileProcessor;
export declare const archive_one_to_one: (label: string, config: {
    basedir: string;
    collector: FileCollector;
    to_dir: string;
    arcname: (p: string, time: Date) => string;
    options?: {
        chown?: number[] | number;
        retainOriginal?: boolean;
    };
}) => FileProcessor;
export declare const backup_file: (label: string, config: {
    basedir: string;
    collector: FileCollector;
    to_dir: string;
}) => FileProcessor;
export declare const cleanup_file: (label: string, config: {
    basedir: string;
    collector: FileCollector;
}) => FileProcessor;
export declare const collect_by_generation: (config: {
    pattern: string[];
    extra_cond: (f: string) => boolean;
    comparator: (a: string, b: string) => number;
    generation: number;
}) => FileCollector;
export declare const collect_by_threshold: (config: {
    pattern: string[];
    extra_cond: (f: string) => boolean;
    comparator: (a: string, b: string) => number;
    slicer: (f: string) => string;
    threshold: (time: Date) => string;
}) => FileCollector;
