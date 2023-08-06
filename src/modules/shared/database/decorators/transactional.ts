import { MikroORM, OptimisticLockError, RequestContext } from '@mikro-orm/core';
import * as retry from 'async-retry';
export interface TransactionalOptions {
  /**
   * @default 2
   */
  retries?: number;
}

export function Transactional<T>(
  options: TransactionalOptions = {
    retries: 2,
  },
): MethodDecorator {
  return function (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: T, ...args: any[]) {
      const orm = (this as any).orm as MikroORM | undefined;

      if (!(orm instanceof MikroORM)) {
        throw new Error(
          '@Transactional() decorator can only be applied to methods of classes with `orm: MikroORM` property`',
        );
      }

      return await retry(
        async (bail) => {
          try {
            return await RequestContext.createAsync(orm.em, async () => {
              const result = await originalMethod.apply(this, args);

              await orm.em.flush();

              return result;
            });
          } catch (e) {
            if (e instanceof OptimisticLockError) {
              throw e;
            }

            // @ts-expect-error Wrong type
            bail(e);
          }
        },
        {
          retries: options.retries,
          factor: 1,
        },
      );
    };

    return descriptor;
  };
}
