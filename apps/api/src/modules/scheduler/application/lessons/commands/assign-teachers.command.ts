import { Context, Transactional } from 'yuow/core';
import { Command, CommandProps, CommandHandler } from '../../../../shared/cqrs';
import { DateTime } from 'luxon';
import { AssignTeachersDto } from '../dtos/assign-teachers.dto';
import { AssignedTeacherDto } from '../dtos/assigned-teacher.dto';
import {
  LessonRepository,
  SchoolRepository,
  SubjectRepository,
  TeacherRepository,
} from '../../../database';

export class AssignTeachersCommand extends Command<AssignedTeacherDto[]> {
  public readonly schoolId: string;
  public readonly subjectId: string;
  public readonly date: string;
  public readonly payload: AssignTeachersDto;

  public constructor(command: CommandProps<AssignTeachersCommand>) {
    super();

    this.schoolId = command.schoolId;
    this.subjectId = command.subjectId;
    this.date = command.date;
    this.payload = command.payload;
  }
}

@CommandHandler(AssignTeachersCommand)
export class AssignTeachersCommandHandler implements CommandHandler<AssignTeachersCommand> {
  @Transactional()
  public async execute({
    schoolId,
    subjectId,
    date,
    payload,
  }: AssignTeachersCommand): Promise<AssignedTeacherDto[]> {
    const lessonRepo = Context.getRepository(LessonRepository);
    const schoolRepo = Context.getRepository(SchoolRepository);
    const subjectRepo = Context.getRepository(SubjectRepository);
    const teacherRepo = Context.getRepository(TeacherRepository);

    const [lesson, school, subject, teachers] = await Promise.all([
      lessonRepo.findBySubjectAndDate(subjectId, date, schoolId),
      schoolRepo.find(schoolId),
      subjectRepo.findBySchool(subjectId, schoolId),
      teacherRepo.findMany(payload.teacherIds, schoolId),
    ]);

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (!school) {
      throw new Error('School not found');
    }

    if (!subject) {
      throw new Error('Subject not found');
    }

    const now = DateTime.now();

    for (const teacher of teachers) {
      lesson.assignTeacher(teacher, subject, school, now);
    }

    return lesson.assignedTeachers.map(
      (at) =>
        new AssignedTeacherDto({
          teacherId: at.teacherId.value,
          assignedAt: at.assignedAt.toISO(),
        }),
    );
  }
}
