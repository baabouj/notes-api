import httpStatus from 'http-status';
import ms from 'ms';

import { config } from '$/config';
import { REFRESH_TOKEN_COOKIE_NAME } from '$/constants';
import { BadRequestException } from '$/exceptions';
import { handleAsync } from '$/lib';
import { authService, tokenService, userService } from '$/services';
import { exclu } from '$/utils';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from '$/validations';

const login = handleAsync(
  async (req, res) => {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    const cookieToken: string = req.cookies[`${REFRESH_TOKEN_COOKIE_NAME}`];

    if (cookieToken) {
      const foundRefreshToken =
        await tokenService.findRefreshToken(cookieToken);

      if (foundRefreshToken)
        await tokenService.deleteToken(foundRefreshToken.id);

      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    const { accessToken, refreshToken } = await tokenService.generateAuthTokens(
      user.id,
    );

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ms(config.refreshToken.maxAge),
    });

    res.send({
      access_token: accessToken,
    });
  },
  {
    schema: loginSchema,
  },
);

const signup = handleAsync(
  async (req, res) => {
    await authService.signup(req.body);
    res.send({
      message:
        'A link to activate your account has been emailed to the address provided.',
    });
  },
  {
    schema: signupSchema,
  },
);

const refresh = handleAsync(async (req, res) => {
  const cookieToken = req.cookies[`${REFRESH_TOKEN_COOKIE_NAME}`];

  if (!cookieToken) throw new BadRequestException();

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
  });

  const token = await tokenService.findRefreshToken(cookieToken);
  if (!token) throw new BadRequestException();

  const { accessToken, refreshToken } = await tokenService.generateAuthTokens(
    token.userId,
  );
  await tokenService.deleteToken(token.id);

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: ms(config.refreshToken.maxAge),
  });

  res.send({
    access_token: accessToken,
  });
});

const logout = handleAsync(
  async (req, res) => {
    const token = req.cookies[`${REFRESH_TOKEN_COOKIE_NAME}`];

    if (token) {
      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      });

      const refreshToken = await tokenService.findRefreshToken(token);

      if (refreshToken) await tokenService.deleteToken(refreshToken.id);
    }

    res.status(httpStatus.NO_CONTENT).send();
  },
  {
    auth: true,
  },
);

const verifyEmail = handleAsync(
  async (req, res) => {
    await authService.verifyEmail(req.query.token);

    res.status(httpStatus.NO_CONTENT).send();
  },
  {
    schema: verifyEmailSchema,
  },
);

const changePassword = handleAsync(
  async ({ body, user: userId }, res) => {
    await authService.changePassword(
      userId as string,
      body.oldPassword,
      body.newPassword,
    );

    res.status(httpStatus.NO_CONTENT).send();
  },
  {
    auth: true,
    schema: changePasswordSchema,
  },
);

const forgotPassword = handleAsync(
  async (req, res) => {
    await authService.sendResetPasswordEmail(req.body.email);

    res.send({
      message:
        'If that email address is in our database, an email is sent to reset your password',
    });
  },
  {
    schema: forgotPasswordSchema,
  },
);

const resetPassword = handleAsync(
  async (req, res) => {
    await authService.resetPassword(req.query.token, req.body.password);

    res.status(httpStatus.NO_CONTENT).send();
  },
  {
    schema: resetPasswordSchema,
  },
);

const sendVerificationEmail = handleAsync(
  async ({ user: userId }, res) => {
    await authService.sendVerificationEmail(userId as string);

    res.send({
      message:
        'If your email address is not already verified, an email is sent to verify your email address',
    });
  },
  {
    auth: true,
  },
);

const findAuthedUser = handleAsync(
  async ({ user: userId }, res) => {
    const user = await userService.find(userId as string);
    res.send(exclu(user!, ['password']));
  },
  {
    auth: true,
  },
);

export {
  changePassword,
  findAuthedUser,
  forgotPassword,
  login,
  logout,
  refresh,
  resetPassword,
  sendVerificationEmail,
  signup,
  verifyEmail,
};
