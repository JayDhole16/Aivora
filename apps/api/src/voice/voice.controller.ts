import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { VoiceService } from './voice.service';
import { CreateVoiceAgentConfigDto, UpdateVoiceAgentConfigDto, PhoneNumberSearchDto, PurchasePhoneNumberDto, TwilioWebhookDto } from './dto/voice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgRole } from '@aivora/shared-types';

@ApiTags('Voice')
@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  // Voice Agent Config
  @Post('services/:serviceId/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create voice agent config' })
  @ApiParam({ name: 'serviceId', description: 'Voice Service ID' })
  async createConfig(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateVoiceAgentConfigDto,
  ) {
    return this.voiceService.createVoiceAgentConfig(req.tenantContext.orgId, userId, serviceId, dto);
  }

  @Get('services/:serviceId/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin', 'agent')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get voice agent config' })
  @ApiParam({ name: 'serviceId', description: 'Voice Service ID' })
  async getConfig(@Req() req: any, @Param('serviceId') serviceId: string) {
    return this.voiceService.findVoiceAgentConfig(req.tenantContext.orgId, serviceId);
  }

  @Put('services/:serviceId/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update voice agent config' })
  @ApiParam({ name: 'serviceId', description: 'Voice Service ID' })
  async updateConfig(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateVoiceAgentConfigDto,
  ) {
    return this.voiceService.updateVoiceAgentConfig(req.tenantContext.orgId, userId, serviceId, dto);
  }

  @Delete('services/:serviceId/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Delete voice agent config' })
  @ApiParam({ name: 'serviceId', description: 'Voice Service ID' })
  async deleteConfig(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.voiceService.deleteVoiceAgentConfig(req.tenantContext.orgId, userId, serviceId);
  }

  // Phone Numbers
  @Get('phone-numbers/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Search available phone numbers' })
  async searchPhoneNumbers(@Req() req: any, @Query() dto: PhoneNumberSearchDto) {
    return this.voiceService.searchPhoneNumbers(req.tenantContext.orgId, dto);
  }

  @Post('phone-numbers/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Purchase a phone number' })
  async purchasePhoneNumber(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() dto: PurchasePhoneNumberDto,
  ) {
    return this.voiceService.purchasePhoneNumber(req.tenantContext.orgId, userId, dto);
  }

  @Get('phone-numbers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin', 'agent')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'List phone numbers' })
  async findPhoneNumbers(@Req() req: any) {
    return this.voiceService.findPhoneNumbers(req.tenantContext.orgId);
  }

  @Delete('phone-numbers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Release a phone number' })
  @ApiParam({ name: 'id', description: 'Phone Number ID' })
  async releasePhoneNumber(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.voiceService.releasePhoneNumber(req.tenantContext.orgId, userId, id);
  }

  // Go Live Check
  @Get('services/:serviceId/go-live-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Check if service can go live' })
  @ApiParam({ name: 'serviceId', description: 'Voice Service ID' })
  async goLiveCheck(@Req() req: any, @Param('serviceId') serviceId: string) {
    return this.voiceService.goLiveCheck(req.tenantContext.orgId, serviceId);
  }

  // Sandbox Call
  @Post('services/:serviceId/sandbox-call')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Initiate a sandbox test call' })
  @ApiParam({ name: 'serviceId', description: 'Voice Service ID' })
  async sandboxCall(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('serviceId') serviceId: string,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    return this.voiceService.initiateSandboxCall(req.tenantContext.orgId, userId, serviceId, phoneNumber);
  }

  // Twilio Webhooks (public endpoints, no auth)
  @Post('webhook/incoming')
  @ApiOperation({ summary: 'Twilio incoming call webhook' })
  @ApiHeader({ name: 'X-Twilio-Signature', description: 'Twilio signature for validation' })
  async handleIncomingCall(
    @Headers('x-twilio-signature') signature: string,
    @Body() webhook: TwilioWebhookDto,
    @Query('sandbox') sandbox?: string,
    @Res() res?: Response,
  ) {
    // In production, validate Twilio signature
    // const isValid = this.validateTwilioSignature(signature, webhook);
    // if (!isValid) throw new UnauthorizedException('Invalid Twilio signature');

    // Extract org from the To phone number
    const phoneNumber = await this.voiceService['prisma'].phoneNumber.findFirst({
      where: { phoneNumber: webhook.To },
    });

    if (!phoneNumber) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Number not configured</Say><Hangup/></Response>`;
      return res?.type('text/xml').send(twiml);
    }

    const twiml = await this.voiceService.handleIncomingCall(phoneNumber.orgId, webhook);
    return res?.type('text/xml').send(twiml);
  }

  @Post('webhook/status')
  @ApiOperation({ summary: 'Twilio call status webhook' })
  async handleCallStatus(
    @Headers('x-twilio-signature') signature: string,
    @Body() webhook: TwilioWebhookDto,
  ) {
    const phoneNumber = await this.voiceService['prisma'].phoneNumber.findFirst({
      where: { phoneNumber: webhook.To },
    });

    if (!phoneNumber) return { message: 'Number not found' };

    return this.voiceService.handleCallStatus(phoneNumber.orgId, webhook);
  }

  @Post('webhook/recording')
  @ApiOperation({ summary: 'Twilio recording webhook' })
  async handleRecording(
    @Headers('x-twilio-signature') signature: string,
    @Body() webhook: TwilioWebhookDto,
  ) {
    const phoneNumber = await this.voiceService['prisma'].phoneNumber.findFirst({
      where: { phoneNumber: webhook.To },
    });

    if (!phoneNumber) return { message: 'Number not found' };

    return this.voiceService.handleRecording(phoneNumber.orgId, webhook);
  }

  @Post('webhook/process-speech')
  @ApiOperation({ summary: 'Process speech from Twilio Gather' })
  async processSpeech(
    @Headers('x-twilio-signature') signature: string,
    @Body() webhook: TwilioWebhookDto,
    @Res() res?: Response,
  ) {
    // This would call the AI Orchestrator
    // For now, return a simple response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you. I've received your message. Goodbye.</Say><Hangup/></Response>`;
    return res?.type('text/xml').send(twiml);
  }
}