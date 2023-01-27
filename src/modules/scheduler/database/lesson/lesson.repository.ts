import { Repository } from 'yuow';
import { Lesson } from '../../domain';
import { LessonDataMapper } from './lesson.datamapper';

export class LessonRepository extends Repository<Lesson, LessonDataMapper> {
  protected mapperConstructor = LessonDataMapper;

  protected extractIdentity(lesson: Lesson) {
    return lesson.id;
  }

  async findOne(...args: Parameters<LessonDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
