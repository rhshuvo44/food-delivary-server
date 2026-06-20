import { config } from "../config/environment";


const formatMessage = (level: string, message: unknown): string => {
    const timestamp = new Date().toISOString();
    const payload = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    return `[${timestamp}] [${level}] ${payload}`;
};

const shouldLog = (): boolean => config.NODE_ENV !== 'test';

export const logger = {
    info: (...message: unknown[]): void => {
        if (!shouldLog()) return;
        console.info(formatMessage('INFO', message.length === 1 ? message[0] : message));
    },
    warn: (...message: unknown[]): void => {
        if (!shouldLog()) return;
        console.warn(formatMessage('WARN', message.length === 1 ? message[0] : message));
    },
    error: (...message: unknown[]): void => {
        if (!shouldLog()) return;
        console.error(formatMessage('ERROR', message.length === 1 ? message[0] : message));
    },
    debug: (...message: unknown[]): void => {
        if (!shouldLog() || config.NODE_ENV !== 'development') return;
        console.debug(formatMessage('DEBUG', message.length === 1 ? message[0] : message));
    },
};
