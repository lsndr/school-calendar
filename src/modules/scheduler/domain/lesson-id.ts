import { ValueObject } from '../../shared/domain';
import { ExactDate } from './exact-date';
import { SubjectId } from './subject-id';

export class LessonId extends ValueObject<'LessonId'> {
  public readonly subjectId: SubjectId;
  public readonly date: ExactDate;

  protected constructor(subjectId: SubjectId, date: ExactDate) {
    super();

    this.subjectId = subjectId;
    this.date = date;
  }

  static create(subjectId: SubjectId, date: ExactDate) {
    return new this(subjectId, date);
  }
}
