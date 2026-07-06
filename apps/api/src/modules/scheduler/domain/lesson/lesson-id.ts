import { randomUUID } from 'crypto';
import { ValueObject } from '../../../shared/domain';

export class LessonId extends ValueObject<'LessonId'> {
  public readonly value: string;

  protected constructor(value: string) {
    super();

    this.value = value;
  }

  public static create(): LessonId {
    return new this(randomUUID());
  }
}
