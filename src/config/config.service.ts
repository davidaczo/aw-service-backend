import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { num } from '../utils/utils';

dotenv.config();

class ConfigService {
  apiVersion: string;

  constructor(private env: { [k: string]: string | undefined }) {
    this.loadApiVersion();
  }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  private loadApiVersion() {
    this.apiVersion = JSON.parse(
      fs.readFileSync('./package.json').toString(),
    ).version;
  }

  public getApiVersion() {
    return this.apiVersion;
  }

  public getMode(): string {
    return this.getValue('MODE', false);
  }

  public getPort() {
    return Number.parseInt(this.getValue('PORT', true), 10);
  }

  public isProductionBuild(): boolean {
    const mode = this.getValue('MODE', false);
    return mode !== 'DEV';
  }

  public isProductionApp(): boolean {
    const app = this.getValue('APP', false);
    return app !== 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const isProd = this.isProductionBuild();
    const entities = isProd
      ? ['dist/entities/**/*.entity.js']
      : ['src/entities/**/*.entity.ts'];
    const migrations = isProd
      ? ['dist/migration/*.js']
      : ['src/migration/*.ts'];
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      entities,
      migrations,
      dropSchema: false,
      autoLoadEntities: true,
      migrationsTableName: 'migrations',
      cli: {
        migrationsDir: 'src/migration',
      },
      migrationsRun: JSON.parse(this.getValue('RUN_MIGRATIONS')),
      ssl: false,
    };
  }

  getExpoAccessToken() {
    return this.getValue('EXPO_ACCESS_TOKEN');
  }

  getBaseUserCredentials() {
    return {
      email: this.getValue('BASE_EMAIL'),
      password: this.getValue('BASE_PASSWORD'),
      firstName: this.getValue('BASE_FIRST_NAME'),
      lastName: this.getValue('BASE_LAST_NAME'),
    };
  }
  getFirebaseConfig() {
    return {
      projectId: this.getValue('FIREBASE_PROJECT_ID'),
      clientEmail: this.getValue('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.getValue('FIREBASE_PRIVATE_KEY'),
    };
  }
  getJwtSecret() {
    return this.getValue('JWT_SECRET');
  }

  getApiUrl(path = '') {
    return this.getValue('API_URL').concat(path);
  }

  getFrontendUrl(path = '') {
    try {
      return this.getValue('FRONTEND_URL', true).concat(path);
    } catch (error) {
      return null;
    }
  }

  getSocketToken() {
    return this.getValue('SOCKET_TOKEN');
  }

  getTokenTTLs() {
    return {
      accessTokenTTL: num(this.getValue('ACCESS_TOKEN_TTL_MINUTES')),
      refreshTokenTTL: num(this.getValue('REFRESH_TOKEN_TTL_DAYS')),
    };
  }

  getIpRegistryConfig() {
    return {
      url: this.getValue('IP_REGISTRY_API_URL'),
      apiKey: this.getValue('IP_REGISTRY_API_KEY'),
    };
  }

  getIsAppWithFirebase() {
    return this.getValue('WITH_FIREBASE', false) === 'true';
  }

  getTfaSessionTTL() {
    return num(this.getValue('TFA_SESSION_TTL_MINUTES'));
  }

  getAllowedOrigins(): string[] {
    try {
      return this.getValue('CORS_ALLOWED_ORIGINS', true).split(',');
    } catch (error) {
      return [];
    }
  }
  getSendgridConfigApiKey() {
    return this.getValue('SENDGRID_API_KEY', false);
  }

  getSendgridFromEmail() {
    return this.getValue('SENDGRID_FROM_EMAIL', false);
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'PORT',
  'MODE',
  'APP',
  'RUN_MIGRATIONS',
  'BASE_EMAIL',
  'BASE_PASSWORD',
  'BASE_FIRST_NAME',
  'BASE_LAST_NAME',
  'JWT_SECRET',
  'ACCESS_TOKEN_TTL_MINUTES',
  'REFRESH_TOKEN_TTL_DAYS',
  'API_URL',
  'SOCKET_TOKEN',
  'IP_REGISTRY_API_URL',
  'IP_REGISTRY_API_KEY',
  'TFA_SESSION_TTL_MINUTES',
]);

export { configService, ConfigService };
