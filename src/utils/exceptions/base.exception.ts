import { HttpException } from '@nestjs/common';

export default class BaseException extends HttpException {
  constructor(private _code: string) {
    super(_code, Number.parseInt(_code.substring(0, 3), 10));
  }

  get code(): string {
    return this._code;
  }
}
