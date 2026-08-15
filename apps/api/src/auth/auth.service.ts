import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { PrismaService } from '../common/prisma/prisma.service';
import { SignupDto, SendOtpDto, VerifyOtpDto, LoginDto, InviteMemberDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const slug = dto.organizationSlug?.toLowerCase() || dto.organizationName.toLowerCase().replace(/\s+/g, '-');
    const existingOrg = await this.prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      throw new ConflictException('Organization slug already taken');
    }

    const passwordHash = await bcrypt.hash(this.generateRandomPassword(), 12);

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        slug,
        members: {
          create: {
            user: {
              create: {
                email: dto.email.toLowerCase(),
                name: dto.name,
                passwordHash,
                emailVerified: false,
              },
            },
            role: 'owner',
            acceptedAt: new Date(),
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    const owner = organization.members[0].user;
    await this.sendOtp(owner.email);

    return { message: 'Signup successful. Please check your email for OTP.', userId: owner.id };
  }

  async sendOtp(dto: SendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = speakeasy.totp({
      secret: this.configService.get('OTP_SECRET') || 'aivora-otp-secret',
      encoding: 'base32',
      step: 300,
      digits: 6,
    });

    this.otpStore.set(user.email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    console.log(`OTP for ${user.email}: ${otp}`);
    return { message: 'OTP sent' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { orgMembers: { include: { organization: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stored = this.otpStore.get(user.email);
    if (!stored) {
      throw new BadRequestException('OTP expired or not requested');
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(user.email);
      throw new BadRequestException('OTP expired');
    }

    if (stored.attempts >= 5) {
      this.otpStore.delete(user.email);
      throw new BadRequestException('Too many attempts');
    }

    if (stored.otp !== dto.otp) {
      stored.attempts++;
      throw new BadRequestException('Invalid OTP');
    }

    this.otpStore.delete(user.email);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { orgMembers: { include: { organization: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.sendOtp({ email: user.email });
    return { message: 'OTP sent to your email' };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { orgMembers: { include: { organization: true } } },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { orgMembers: { include: { organization: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async inviteMember(currentUserId: string, orgId: string, dto: InviteMemberDto) {
    const membership = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: currentUserId } },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      const existingMembership = await this.prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId, userId: existingUser.id } },
      });
      if (existingMembership) {
        throw new ConflictException('User is already a member');
      }
    }

    const invitedUser = existingUser || await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(this.generateRandomPassword(), 12),
        emailVerified: false,
      },
    });

    await this.prisma.orgMember.create({
      data: {
        orgId,
        userId: invitedUser.id,
        role: dto.role,
        invitedBy: currentUserId,
        invitedAt: new Date(),
      },
    });

    await this.sendOtp({ email: invitedUser.email });
    return { message: 'Invitation sent' };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      orgs: user.orgMembers.map((om: any) => ({
        orgId: om.orgId,
        orgName: om.organization.name,
        orgSlug: om.organization.slug,
        role: om.role,
      })),
    };
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-16);
  }
}