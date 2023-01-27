import { LessonId, SubjectId } from '../../domain';
import { ExactDate } from '../../domain/exact-date';

export class LessonIdHydrator extends LessonId {
  constructor(subjectId: SubjectId, date: ExactDate) {
    super(subjectId, date);
  }
}
