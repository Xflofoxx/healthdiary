import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

interface Config {
  server: {
    host: string;
    port: number;
    cors: {
      origin: string | string[];
      credentials: boolean;
    };
  };
  database: {
    sqlite: { pathdata: string };
    duckdb: { path: string };
  };
  webauthn: {
    rpId: string;
    rpName: string;
    origin: string;
  };
  demo: {
    username: string;
    password: string;
    displayName: string;
  };
  client: {
    apiUrl: string;
    title: string;
  };
}

let config: Config | null = null;

export function loadConfig(): Config {
  if (config) return config;

  const configPath = join(process.cwd(), '..', 'config.yaml');
  const file = readFileSync(configPath, 'utf8');
  config = parse(file) as Config;
  return config;
}

export function getConfig(): Config {
  if (!config) {
    return loadConfig();
  }
  return config;
}
