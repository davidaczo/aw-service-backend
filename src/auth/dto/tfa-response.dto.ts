export class TfaResponseDto implements Readonly<TfaResponseDto> {
  secondFactorRequired: boolean;
  tfaSessionToken: string;
}
