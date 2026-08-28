import { Context, Transactional } from 'yuow/core';
import { Command, CommandHandler, CommandProps } from '../../../../shared/cqrs';
import { Teacher, TeacherId } from '../../../domain';
import { DateTime } from 'luxon';
import { TeacherDto } from '../dtos/teacher.dto';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { SchoolRepository, TeacherRepository } from '../../../database';

export class CreateTeacherCommand extends Command<TeacherDto> {
  public readonly schoolId: string;
  public readonly payload: CreateTeacherDto;

  public constructor(props: CommandProps<CreateTeacherCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.payload = props.payload;
  }
}

@CommandHandler(CreateTeacherCommand)
export class CreateTeacherCommandHandler implements CommandHandler<CreateTeacherCommand> {
  @Transactional()
  public async execute({
    schoolId,
    payload,
  }: CreateTeacherCommand): Promise<TeacherDto> {
    const schoolRepo = Context.getRepository(SchoolRepository);
    const teacherRepo = Context.getRepository(TeacherRepository);

    const school = await schoolRepo.find(schoolId);

    if (!school) {
      throw new Error('School not found');
    }

    const id = TeacherId.create();
    const name = payload.name;

    const teacher = Teacher.create({
      id,
      name,
      school,
      now: DateTime.now(),
    });

    teacherRepo.add(teacher);

    return new TeacherDto({
      id: teacher.id.value,
      name: teacher.name,
    });
  }
}
