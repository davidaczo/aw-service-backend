export class CheckEmailResponseDto implements Readonly<CheckEmailResponseDto> {
  isExists: boolean;

  constructor(isExists: boolean) {
    this.isExists = isExists;
  }
}
