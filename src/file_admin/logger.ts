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

import winston from 'winston'
import {Syslog} from 'winston-syslog'

export interface SyslogOptions {
    protocol?: string;
    path?: string,
    host?: string,
    port?: number
}

let console_enabled = false
let syslog_enabled = false
let syslog_options: SyslogOptions = {
    protocol: 'unix',
    path: '/dev/log',
    host: 'localhost',
    port: 514,
}

export const enableLogging = (config: {
    console?: boolean,
    syslog?: boolean,
    syslog_options?: SyslogOptions,
}) => {
    console_enabled = config.console ?? console_enabled
    syslog_enabled = config.syslog ?? syslog_enabled
    syslog_options = {...syslog_options, ...config.syslog_options}
}

export class Logger {
    private readonly logger?: winston.Logger

    constructor(label: string) {
        const transports: winston.transport[] = []
        if (console_enabled) {
            transports.push(
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.cli()
                })
            )
        }
        if (syslog_enabled) {
            transports.push(
                new Syslog({
                    level: 'info',
                    format: winston.format.simple(),
                    app_name: 'FILEADMIN',
                    ...syslog_options,
                })
            )
        }
        this.logger = transports.length === 0 ? undefined :
            winston.createLogger({
                level: 'debug',
                format: winston.format.combine(
                    winston.format.label({
                        label: label,
                        message: true,
                    }),
                    winston.format.splat(),
                ),
                transports: transports,
            })
    }

    debug(message: string, ...args: any[]) {
        this.logger?.debug(message, ...args)
    }

    info(message: string, ...args: any[]) {
        this.logger?.info(message, ...args)
    }

    error(message: string, ...args: any[]) {
        this.logger?.error(message, ...args)
    }

    close() {
        this.logger?.close()
    }
}
