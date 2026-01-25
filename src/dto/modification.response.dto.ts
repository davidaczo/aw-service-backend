export class ModificationResponseDto {
  success: boolean;

  constructor(success = true) {
    this.success = success;
  }
}
