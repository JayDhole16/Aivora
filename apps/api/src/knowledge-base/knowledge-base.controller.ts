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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKnowledgeBaseEntryDto, UpdateKnowledgeBaseEntryDto, SearchKnowledgeBaseDto, BulkCreateKBEntriesDto } from './dto/knowledge-base.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrgRole } from '@aivora/shared-types';

@ApiTags('Knowledge Base')
@Controller('knowledge-base')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'agent')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a knowledge base entry' })
  async create(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() dto: CreateKnowledgeBaseEntryDto,
  ) {
    return this.kbService.create(req.tenantContext.orgId, userId, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create knowledge base entries (from document review)' })
  async bulkCreate(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Body() dto: BulkCreateKBEntriesDto,
  ) {
    return this.kbService.bulkCreate(req.tenantContext.orgId, userId, dto.entries);
  }

  @Get()
  @ApiOperation({ summary: 'List knowledge base entries' })
  async findAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.kbService.findAll(req.tenantContext.orgId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a knowledge base entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.kbService.findOne(req.tenantContext.orgId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a knowledge base entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  async update(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeBaseEntryDto,
  ) {
    return this.kbService.update(req.tenantContext.orgId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a knowledge base entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  async delete(@CurrentUser('id') userId: string, @Req() req: any, @Param('id') id: string) {
    return this.kbService.delete(req.tenantContext.orgId, userId, id);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search knowledge base with semantic similarity' })
  async search(@Req() req: any, @Body() dto: SearchKnowledgeBaseDto) {
    return this.kbService.search(req.tenantContext.orgId, dto);
  }

  @Post('extract')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Extract KB candidates from PDF document' })
  async extractFromDocument(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.kbService.extractFromDocument(req.tenantContext.orgId, file);
  }
}