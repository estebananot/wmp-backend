import { Result } from './result';

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const result = Result.ok('value');

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe('value');
    });

    it('should allow getting value without throwing', () => {
      const result = Result.ok({ data: 'test' });

      expect(result.value.data).toBe('test');
    });
  });

  describe('fail', () => {
    it('should create a failed result', () => {
      const error = new Error('Test error');
      const result = Result.fail(error);

      expect(result.isFailure).toBe(true);
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('value getter', () => {
    it('should throw when getting value of failed result', () => {
      const result = Result.fail(new Error('Test error'));

      expect(() => result.value).toThrow('Cannot get value of a failed result');
    });
  });

  describe('error getter', () => {
    it('should throw when getting error of successful result', () => {
      const result = Result.ok('value');

      expect(() => result.error).toThrow(
        'Cannot get error of a successful result',
      );
    });
  });

  describe('map', () => {
    it('should transform value on success', () => {
      const result = Result.ok(5).map((x) => x * 2);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should pass through error on failure', () => {
      const error = new Error('Test error');
      const result = Result.fail<number>(error).map((x) => x * 2);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe('flatMap', () => {
    it('should chain successful results', () => {
      const result = Result.ok(5).flatMap((x) => Result.ok(x * 2));

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should pass through error on failure', () => {
      const error = new Error('Test error');
      const result = Result.fail<number>(error).flatMap((x) =>
        Result.ok(x * 2),
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });

    it('should allow returning failure from flatMap', () => {
      const error = new Error('Chained error');
      const result = Result.ok(5).flatMap(() => Result.fail(error));

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });
  });
});
