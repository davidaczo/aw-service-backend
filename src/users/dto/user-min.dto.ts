export class UserMinDto implements Readonly<UserMinDto> {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;

  constructor(data) {
    if (data) {
      this.id = data.id;
      if (data.firstName) {
        this.firstName = data.firstName;
      }
      if (data.lastName) {
        this.lastName = data.lastName;
      }
      if (data.firstName && data.lastName) {
        this.fullName = `${data.lastName} ${data.firstName}`;
      }
    }
  }
}
