global {
    export interface FileProcessor {
        process: (time: Date, dryRun: boolean) => boolean;
        validate: () => boolean;
    }
    export interface FileCollector {
        collect: (time: Date) => string[];
        validate: () => boolean;
    }
    export declare const archive_many_to_one: (label: string, config: {
        basedir: string;
        collector: FileCollector;
        to_dir: string;
        arcname: string;
        options?: {
            owner?: string;
        };
    }) => FileProcessor;
    export declare const archive_one_to_one: (label: string, config: {
        basedir: string;
        collector: any;
        to_dir: string;
        arcname: (p: string) => string;
        options?: {
            owner?: string;
        };
    }) => FileProcessor;
    export declare const backup_file: (label: string, config: {
        basedir: string;
        collector: any;
        to_dir: string;
    }) => FileProcessor;
    export declare const cleanup_file: (label: string, config: {
        basedir: string;
        collector: any;
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
}
