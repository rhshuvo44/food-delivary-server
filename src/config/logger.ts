import morgan from 'morgan';
import { config } from './environment';

const morganFormat = config.NODE_ENV === 'production' ? 'combined' : 'dev';

export const logger = morgan(morganFormat);
