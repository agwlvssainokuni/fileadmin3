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

export let console_enabled = false
export let syslog_enabled = false

export const enableLogging = (config: {
    console?: boolean,
    syslog?: boolean,
}) => {
    console_enabled = config.console ?? console_enabled
    syslog_enabled = config.syslog ?? syslog_enabled
}

export class Logger {
    private readonly logger: winston.Logger
    private readonly syslog: winston.Logger

    constructor(label: string) {
        this.logger = winston.createLogger({
            level: 'debug',
            format: winston.format.combine(
                winston.format.label({
                    label: label,
                    message: true,
                }),
                winston.format.splat(),
                winston.format.cli(),
            ),
            transports: [new winston.transports.Console()],
        })
        this.syslog = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.label({
                    label: label,
                    message: true,
                }),
                winston.format.splat(),
                winston.format.simple(),
            ),
            transports: [new Syslog({
                app_name: 'FILEADMIN',
                protocol: 'unix',
                path: '/dev/log',
            })],
        })
    }

    debug(message: string, ...args: any[]) {
        if (console_enabled) {
            this.logger.debug(message, ...args)
        }
        if (syslog_enabled) {
            this.syslog.debug(message, ...args)
            console.log(message, ...args)
        }
    }

    info(message: string, ...args: any[]) {
        if (console_enabled) {
            this.logger.info(message, ...args)
        }
        if (syslog_enabled) {
            this.syslog.info(message, ...args)
            console.log(message, ...args)
        }
    }

    error(message: string, ...args: any[]) {
        if (console_enabled) {
            this.logger.error(message, ...args)
        }
        if (syslog_enabled) {
            this.syslog.error(message, ...args)
            console.log(message, ...args)
        }
    }
}
