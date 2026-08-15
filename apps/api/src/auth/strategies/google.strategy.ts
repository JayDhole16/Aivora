import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') || 'mock-client-id',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || 'mock-client-secret',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, displayName, photos, id } = profile;
    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      name: displayName,
      avatarUrl: photos[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}