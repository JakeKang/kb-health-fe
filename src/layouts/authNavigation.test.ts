import { describe, expect, it } from 'vitest';

import { getAuthNavigationItem } from '@/layouts/authNavigation';

describe('getAuthNavigationItem', () => {
  it('points guests to sign-in', () => {
    expect(getAuthNavigationItem(false)).toEqual({
      to: '/sign-in',
      label: '로그인',
    });
  });

  it('points authenticated users to the user page', () => {
    expect(getAuthNavigationItem(true)).toEqual({
      to: '/user',
      label: '회원정보',
    });
  });
});
