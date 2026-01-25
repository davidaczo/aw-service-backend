import {
  Injectable,
  PipeTransform,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';
import BaseException from '../exceptions/base.exception';
import { num } from '../utils';
import { isValid } from 'date-fns';

export const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

export const ValidationPipe = new NestValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  exceptionFactory: (errors: ValidationError[]) => {
    return new ValidationException(errors);
  },
});

@Injectable()
export class EnumValidationPipe implements PipeTransform {
  constructor(
    private readonly targetEnum: any,
    private readonly errorCode: string,
  ) {}
  transform(value: string): any {
    if (value) {
      if (!this.targetEnum[value]) {
        throw new BaseException(this.errorCode);
      }
      return this.targetEnum[value];
    }
    return null;
  }
}

@Injectable()
export class EnumListValidationPipe implements PipeTransform {
  constructor(
    private readonly targetEnum: any,
    private readonly errorCode: string,
  ) {}
  transform(value: string): string[] {
    if (value) {
      const tmp = Array.from(new Set(value.split(',')));
      const r = [];
      tmp.forEach((item) => {
        if (!this.targetEnum[item]) {
          throw new BaseException(this.errorCode);
        }
        r.push(this.targetEnum[item]);
      });
      return r;
    }
    return [];
  }
}

@Injectable()
export class UUIDValidationPipe implements PipeTransform {
  private readonly errorCode: string;
  private readonly nullAccepted: boolean;
  constructor(errorCode: string, nullAccepted = false) {
    this.errorCode = errorCode;
    this.nullAccepted = nullAccepted;
  }
  transform(value: string): any {
    if (value) {
      if (this.nullAccepted && value.toLowerCase() === 'null') {
        return null;
      }
      if (!value.match(uuidRegex)) {
        throw new BaseException(this.errorCode);
      }
      return value;
    }
    return '';
  }
}

@Injectable()
export class UUIDListValidationPipe implements PipeTransform {
  constructor(private readonly errorCode: string) {}
  transform(value: string): string[] {
    if (value) {
      const tmp = Array.from(new Set(value.split(',')));
      tmp.forEach((item) => {
        if (!item.match(uuidRegex)) {
          throw new BaseException(this.errorCode);
        }
      });
      return tmp;
    }
    return [];
  }
}

@Injectable()
export class DateValidationPipe implements PipeTransform {
  constructor(private readonly errorCode: string) {}
  transform(value: string): any {
    if (value) {
      const d = new Date(value);
      if (!isValid(d)) {
        throw new BaseException(this.errorCode);
      }
      return value;
    }
    return '';
  }
}

@Injectable()
export class DateListValidationPipe implements PipeTransform {
  constructor(private readonly errorCode: string) {}
  transform(value: string): string[] {
    if (value) {
      const tmp = Array.from(new Set(value.split(',')));
      tmp.forEach((item) => {
        const d = new Date(item);
        if (!isValid(d)) {
          throw new BaseException(this.errorCode);
        }
      });
      return tmp;
    }
    return [];
  }
}

@Injectable()
export class NumberListValidationPipe implements PipeTransform {
  constructor(private readonly errorCode: string) {}
  transform(value: string): number[] {
    if (value) {
      const tmp = Array.from(new Set(value.split(','))).map(num);
      const r = [];
      tmp.forEach((item) => {
        if (Number.isNaN(item)) {
          throw new BaseException(this.errorCode);
        }
        r.push(item);
      });
      return r;
    }
    return [];
  }
}

export type SortParam = {
  column: string;
  direction: 'ASC' | 'DESC';
};

@Injectable()
export class SortParamListValidationPipe implements PipeTransform {
  constructor(
    private readonly sortParamEnum: any,
    private readonly errorCode: string,
  ) {}
  transform(value: string): string[] {
    if (value) {
      const tmp = Array.from(new Set(value.split(',')));
      const r = [];
      tmp.forEach((item) => {
        const s = item.split(' ');
        if (s.length !== 2) {
          throw new BaseException(this.errorCode);
        }
        const [column, direction] = s;
        if (
          !this.sortParamEnum[column] ||
          !['ASC', 'DESC'].includes(direction)
        ) {
          throw new BaseException(this.errorCode);
        }
        r.push({ column, direction });
      });
      return r;
    }
    return [];
  }
}
