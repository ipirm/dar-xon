import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

export class ThrottlePhoneGuard extends ThrottlerGuard {
  protected throwThrottlingException(): void {
    throw new ThrottlerException("Подтверждение номера можно запрашивать не раньше чем раз в минуту");
  }
}