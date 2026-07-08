import { describe, it, expect } from 'vitest';
import { normalize } from './mapper.service';

describe('mapper.service normalize', () => {
  it('fills all 15 fields and keeps a valid record', () => {
    const { records } = normalize(
      [{ name: 'John', email: 'john@x.com' }],
      []
    );
    expect(records).toHaveLength(1);
    expect(Object.keys(records[0])).toHaveLength(15);
    expect(records[0].company).toBe('');
  });

  it('blanks invalid enum values', () => {
    const { records } = normalize(
      [
        {
          email: 'a@b.com',
          crm_status: 'NOT_A_STATUS',
          data_source: 'nope',
        } as never,
      ],
      []
    );
    expect(records[0].crm_status).toBe('');
    expect(records[0].data_source).toBe('');
  });

  it('keeps valid enum values', () => {
    const { records } = normalize(
      [
        {
          email: 'a@b.com',
          crm_status: 'SALE_DONE',
          data_source: 'eden_park',
        } as never,
      ],
      []
    );
    expect(records[0].crm_status).toBe('SALE_DONE');
    expect(records[0].data_source).toBe('eden_park');
  });

  it('blanks unparseable created_at', () => {
    const { records } = normalize(
      [{ email: 'a@b.com', created_at: 'not a date' }],
      []
    );
    expect(records[0].created_at).toBe('');
  });

  it('drops records with neither email nor phone', () => {
    const { records, skipped } = normalize([{ name: 'Ghost' }], []);
    expect(records).toHaveLength(0);
    expect(skipped).toHaveLength(1);
  });

  it('keeps records that have only a phone', () => {
    const { records } = normalize(
      [{ mobile_without_country_code: '9876543210' }],
      []
    );
    expect(records).toHaveLength(1);
  });
});
