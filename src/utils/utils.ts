import { getRepository } from 'typeorm';
import BaseException from './exceptions/base.exception';
import { Session } from '../entities/session.entity';
import * as bowser from 'bowser';
import { TfaSession } from '../entities/tfa-session.entity';
import * as speakeasy from 'speakeasy';

export const num = (v: number | string) => Number.parseInt(v.toString());

export const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '');

export const capitalize = (s: string) =>
  !s ? s : s.charAt(0).toUpperCase() + s.slice(1);

const validateToken = async (
  tokenData: string,
  tokenType: 'ACCESS' | 'REFRESH',
): Promise<Session> => {
  const fields = tokenData.split('#');
  if (fields.length !== 3) {
    throw new BaseException('400jwt00');
  }
  const [type, sessionId, sessionVersion] = fields;
  if (type !== tokenType) {
    throw new BaseException('400jwt00');
  }

  const session = await getRepository(Session).findOne({
    where: {
      id: sessionId,
      version: num(sessionVersion),
      isDeleted: false,
    },
  });

  if (!session) {
    throw new BaseException('400jwt00');
  }
  return session;
};

export const validateTfaToken = async (
  tokenData: string,
): Promise<TfaSession> => {
  const fields = tokenData.split('#');
  if (fields.length !== 2) {
    throw new BaseException('400otp00');
  }
  const [type, sessionId] = fields;

  if (type !== 'TFA') {
    throw new BaseException('400otp00');
  }

  const tfaSession = await getRepository(TfaSession).findOne({
    where: {
      id: sessionId,
      isDeleted: false,
    },
  });
  if (!tfaSession) {
    throw new BaseException('400otp00');
  }
  return tfaSession;
};

export const validateAuthToken = async (
  tokenData: string,
  tokenType: 'ACCESS' | 'REFRESH',
): Promise<Session> => {
  return (await validateToken(tokenData, tokenType)) as Session;
};

export const getDeviceInfo = (
  req: any,
): {
  operatingSystem: string | null;
  browser: string | null;
  ipAddress: string | null;
} => {
  const parser = bowser.getParser(req?.headers?.['user-agent']);
  const os = parser.getOS();
  const browser = parser.getBrowserName() || null;
  const ipAddress = req?.headers?.['x-real-ip'] || null;
  let operatingSystem = null;
  if (os) {
    if (os.name) {
      if (os.versionName) {
        operatingSystem = `${os.name} ${os.versionName}`;
      } else {
        operatingSystem = `${os.name} ${os.version}`;
      }
    }
  }
  return { operatingSystem, browser, ipAddress };
};

export const verifyOneTimePassword = (code: string, secret: string) => {
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: code,
    window: 2,
  });
  if (!verified) {
    throw new BaseException('400otp02');
  }
};
