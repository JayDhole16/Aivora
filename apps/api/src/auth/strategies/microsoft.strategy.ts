import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('MICROSOFT_CLIENT_ID') || 'mock-client-id',
      clientSecret: configService.get('MICROSOFT_CLIENT_SECRET') || 'mock-client-secret',
      callbackURL: configService.get('MICROSOFT_CALLBACK_URL') || 'http://localhost:3001/api/auth/microsoft/callback',
      scope: ['user.read'],
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
      provider: 'microsoft',
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