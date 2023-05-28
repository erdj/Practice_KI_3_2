import { User, UserRes } from 'types';

export const userResToUserType = ({ user: { __v, ...otherUserRes } }: UserRes): User => {
  return { ...otherUserRes };
};
