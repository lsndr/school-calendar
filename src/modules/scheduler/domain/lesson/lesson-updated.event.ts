export class LessonUpdatedEvent {
  id: {
    subjectId: string;
    date: {
      day: number;
      month: number;
      year: number;
    };
  };
  time: {
    startsAt: number;
    duration: number;
  };
  teacherIds: Array<string>;
  createdAt: string;
  updatedAt: string;

  constructor(event: LessonUpdatedEvent) {
    this.id = event.id;
    this.time = event.time;
    this.teacherIds = event.teacherIds;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}
