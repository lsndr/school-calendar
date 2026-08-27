import { Context, Transactional } from 'yuow/core';
import { Command, CommandHandler, CommandProps } from '../../../../shared/cqrs';
import { DateTime } from 'luxon';
import { AssignedTeacherDto } from '../dtos/assigned-teacher.dto';
import { UnassignTeachersDto } from '../dtos/unassign-teachers.dto';
import { LessonRepository, SchoolRepository } from '../../../database';

export class UnassignTeachersCommand extends Command<AssignedTeacherDto[]> {
  public readonly schoolId: string;
  public readonly subjectId: string;
  public readonly date: string;
  public readonly payload: UnassignTeachersDto;

  public constructor(props: CommandProps<UnassignTeachersCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.subjectId = props.subjectId;
    this.date = props.date;
    this.payload = props.payload;
  }
}

@CommandHandler(UnassignTeachersCommand)
export class UnassignTeachersCommandHandler implements CommandHandler<UnassignTeachersCommand> {
  @Transactional()
  public async execute({
    schoolId,
    subjectId,
    date,
    payload,
  }: UnassignTeachersCommand): Promise<AssignedTeacherDto[]> {
    const lessonRepo = Context.getRepository(LessonRepository);
    const schoolRepo = Context.getRepository(SchoolRepository);

    const [lesson, school] = await Promise.all([
      lessonRepo.findBySubjectAndDate(subjectId, date, schoolId),
      schoolRepo.find(schoolId),
    ]);

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (!school) {
      throw new Error('School not found');
    }

    const now = DateTime.now();

    for (const id of payload.teacherIds) {
      lesson.unassignTeacher(id, school, now);
    }

    return lesson.assignedTeachers.map((teacher) => ({
      teacherId: teacher.teacherId.value,
      assignedAt: teacher.assignedAt.toISO(),
    }));
  }
}
