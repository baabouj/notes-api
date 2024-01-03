import type { User } from '@prisma/client';
import type { Request } from 'express';
import passport from 'passport';

import { UnauthorizedException } from '$/exceptions';

const verifyCallback =
  (req: Request, withVerifiedEmail: boolean, resolve: any, reject: any) =>
  async (err: any, user: User, info: any) => {
    if (err || info || !user) {
      return reject(new UnauthorizedException());
    }
    if (withVerifiedEmail && !user.emailVerifiedAt) {
      return reject(
        new UnauthorizedException('Please verify your email address'),
      );
    }
    req.user = user.id;
    return resolve(user);
  };

const checkAuth = async (req: Request, withVerifiedEmail: boolean) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyCallback(req, withVerifiedEmail, resolve, reject),
    )(req);
  });
};

export { checkAuth };
