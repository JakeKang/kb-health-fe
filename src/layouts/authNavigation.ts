export type AuthNavigationItem = {
  to: '/sign-in' | '/user';
  label: '로그인' | '회원정보';
};

export function getAuthNavigationItem(
  isAuthenticated: boolean,
): AuthNavigationItem {
  return isAuthenticated
    ? {
        to: '/user',
        label: '회원정보',
      }
    : {
        to: '/sign-in',
        label: '로그인',
      };
}
