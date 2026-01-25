export class PwdTokenValidationDto implements Readonly<PwdTokenValidationDto> {
  email: string;
  firstName: string;
  lastName: string;
  passwordExists: boolean;

  constructor(
    email: string,
    firstName: string,
    lastName: string,
    passwordExists: boolean,
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.passwordExists = passwordExists;
  }
}
