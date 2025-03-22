import { config as configDotenv } from 'dotenv';
import { Config } from '../types';

const REQUIRED_ENVIRONMENT_VARIABLES = ['CHAT_GPT_KEY'];

const checkEnvironmentVariables = (requiredEnvironmentVariables: string[]) => {
    if (requiredEnvironmentVariables.some((variable) => !(variable in process.env))) {
        const missingVariables = requiredEnvironmentVariables.find((variable) => !(variable in process.env));
        throw new Error(`missing environment variable: ${missingVariables}`);
    }
};

let config: Config;

export const getConfig = (): Config => {
    if (config) {
        return config;
    }

    configDotenv();

    const { env } = process as { env: Record<string, string> };
    const isProductionEnv = env.NODE_ENV === 'production';

    checkEnvironmentVariables([
        ...REQUIRED_ENVIRONMENT_VARIABLES,
        ...(isProductionEnv ? ['HTTPS_KEY', 'HTTPS_CERT'] : []),
    ]);

    config = {
        isProductionEnv,
        port: Number(env.PORT) || 3000,
        chatgptApiKey: env.CHAT_GPT_KEY,
        httpsKey: env.HTTPS_KEY || '',
        httpsCert: env.HTTPS_CERT || '',
    };

    return config;
};
