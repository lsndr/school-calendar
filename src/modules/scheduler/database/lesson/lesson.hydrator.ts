import { Lesson, LessonState } from '../../domain';

export class LessonHydrator extends Lesson {
  constructor(state: LessonState) {
    super(state);
  }
}
