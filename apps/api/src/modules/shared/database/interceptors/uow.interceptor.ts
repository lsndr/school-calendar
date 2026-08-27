import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { Uow, UowContext } from 'yuow/core';
import { type Observable, from, lastValueFrom } from 'rxjs';

@Injectable()
export class UowInterceptor implements NestInterceptor {
  public constructor(private readonly uow: Uow<any>) {}

  public intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return from(
      UowContext.create(this.uow, () => lastValueFrom(next.handle())),
    );
  }
}
