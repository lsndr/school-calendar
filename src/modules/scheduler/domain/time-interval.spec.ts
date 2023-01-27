import { TimeInterval } from './time-interval';

describe('TimeInterval', () => {
  describe('Start Time', () => {
    it('should fail if startsAt is float', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 1.5,
          duration: 1,
        });

      expect(act).toThrow('startsAt must be integer');
    });

    it('should fail if startsAt is NaN', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: NaN,
          duration: 1,
        });

      expect(act).toThrow('startsAt must be integer');
    });

    it('should fail if startsAt is Infinity', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: Infinity,
          duration: 1,
        });

      expect(act).toThrow('startsAt must be integer');
    });

    it('should fail if startsAt is -1', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: -1,
          duration: 1,
        });

      expect(act).toThrow('startsAt should not be negative');
    });

    it('should fail if startsAt is 1440', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 1440,
          duration: 1,
        });

      expect(act).toThrow('startsAt must less than 1440');
    });

    it('should succeed if startsAt is 0', () => {
      const timeInterval = TimeInterval.create({
        startsAt: 0,
        duration: 1,
      });

      expect(timeInterval.startsAt).toBe(0);
    });

    it('should succeed if startsAt is 1439', () => {
      const timeInterval = TimeInterval.create({
        startsAt: 1439,
        duration: 1,
      });

      expect(timeInterval.startsAt).toBe(1439);
    });
  });

  describe('Duration', () => {
    it('should fail if duration is float', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 0,
          duration: 1.5,
        });

      expect(act).toThrow('duration must be integer');
    });

    it('should fail if duration is NaN', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 0,
          duration: NaN,
        });

      expect(act).toThrow('duration must be integer');
    });

    it('should fail if duration is Infinity', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 0,
          duration: Infinity,
        });

      expect(act).toThrow('duration must be integer');
    });

    it('should fail if duration is -1', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 0,
          duration: -1,
        });

      expect(act).toThrow('duration should be positive');
    });

    it('should fail if duration is 0', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 0,
          duration: 0,
        });

      expect(act).toThrow('duration should be positive');
    });

    it('should fail if duration is 1441', () => {
      const act = () =>
        TimeInterval.create({
          startsAt: 0,
          duration: 1441,
        });

      expect(act).toThrow('duration should not exceed 1440');
    });

    it('should succeed if duration is 1', () => {
      const timeInterval = TimeInterval.create({
        startsAt: 0,
        duration: 1,
      });

      expect(timeInterval.duration).toBe(1);
    });

    it('should succeed if duration is 1440', () => {
      const timeInterval = TimeInterval.create({
        startsAt: 1,
        duration: 1440,
      });

      expect(timeInterval.duration).toBe(1440);
    });
  });
});
