import { registerGraphQL as graphql } from './graphql';



import caching from './caching';
import rateLimit from './rateLimit';
import helmet from './helmet';
import corsFastify from './corsFastify';
import underPressureFastify from './underPressureFastify';
import slowDownFastify from './slowDownFastify';
import compressFastify from './compressFastify';
import multipart from './multipar';
import dbConection from './db-conection';

export {
    graphql,
    caching,
    rateLimit,
    helmet,
    corsFastify,
    underPressureFastify,
    slowDownFastify,
    compressFastify,
    multipart,
    dbConection,
}