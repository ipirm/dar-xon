import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

export class ThrottleEmailGuard extends ThrottlerGuard {
  protected throwThrottlingException(): void {
    throw new ThrottlerException("Подтверждение почты можно запрашивать не раньше чем раз в минуту");
  }
}