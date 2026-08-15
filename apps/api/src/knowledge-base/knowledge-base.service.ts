import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateKnowledgeBaseEntryDto, UpdateKnowledgeBaseEntryDto, SearchKnowledgeBaseDto, CandidateKBEntryDto } from './dto/knowledge-base.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(orgId: string, userId: string, dto: CreateKnowledgeBaseEntryDto) {
    const embedding = await this.generateEmbedding(dto.content);
    
    const entry = await this.prisma.knowledgeBaseEntry.create({
      data: {
        orgId,
        title: dto.title,
        content: dto.content,
        embedding,
        metadata: dto.metadata || {},
        source: 'manual',
      },
    });

    await this.auditLog(orgId, userId, 'kb_entry.create', 'KnowledgeBaseEntry', entry.id, null, entry);
    return entry;
  }

  async bulkCreate(orgId: string, userId: string, entries: CandidateKBEntryDto[]) {
    const results = [];
    for (const entry of entries) {
      const embedding = await this.generateEmbedding(entry.content);
      const created = await this.prisma.knowledgeBaseEntry.create({
        data: {
          orgId,
          title: entry.title,
          content: entry.content,
          embedding,
          metadata: entry.metadata || {},
          source: 'manual',
        },
      });
      results.push(created);
    }
    return results;
  }

  async findAll(orgId: string, page = 1, limit = 20) {
    const [entries, total] = await Promise.all([
      this.prisma.knowledgeBaseEntry.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.knowledgeBaseEntry.count({ where: { orgId } }),
    ]);
    return { entries, total, page, limit };
  }

  async findOne(orgId: string, id: string) {
    const entry = await this.prisma.knowledgeBaseEntry.findUnique({ where: { id } });
    if (!entry || entry.orgId !== orgId) {
      throw new NotFoundException('Knowledge base entry not found');
    }
    return entry;
  }

  async update(orgId: string, userId: string, id: string, dto: UpdateKnowledgeBaseEntryDto) {
    const entry = await this.prisma.knowledgeBaseEntry.findUnique({ where: { id } });
    if (!entry || entry.orgId !== orgId) {
      throw new NotFoundException('Knowledge base entry not found');
    }

    const before = { ...entry };
    const content = dto.content ?? entry.content;
    const embedding = dto.content ? await this.generateEmbedding(content) : entry.embedding;

    const updated = await this.prisma.knowledgeBaseEntry.update({
      where: { id },
      data: {
        title: dto.title ?? entry.title,
        content,
        embedding,
        metadata: dto.metadata ?? entry.metadata,
      },
    });

    await this.auditLog(orgId, userId, 'kb_entry.update', 'KnowledgeBaseEntry', id, before, updated);
    return updated;
  }

  async delete(orgId: string, userId: string, id: string) {
    const entry = await this.prisma.knowledgeBaseEntry.findUnique({ where: { id } });
    if (!entry || entry.orgId !== orgId) {
      throw new NotFoundException('Knowledge base entry not found');
    }

    await this.prisma.knowledgeBaseEntry.delete({ where: { id } });
    await this.auditLog(orgId, userId, 'kb_entry.delete', 'KnowledgeBaseEntry', id, entry, null);
    return { message: 'Knowledge base entry deleted' };
  }

  async search(orgId: string, dto: SearchKnowledgeBaseDto) {
    const { query, topK = 5, threshold = 0.7 } = dto;
    const embedding = await this.generateEmbedding(query);

    const results = await this.prisma.$queryRaw`
      SELECT id, org_id as "orgId", title, content, metadata, source, 
             1 - (embedding <=> ${embedding}::vector) as similarity
      FROM "KnowledgeBaseEntry"
      WHERE org_id = ${orgId}::uuid
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> ${embedding}::vector) >= ${threshold}
      ORDER BY embedding <=> ${embedding}::vector
      LIMIT ${topK}
    `;

    return results;
  }

  async extractFromDocument(orgId: string, file: Express.Multer.File): Promise<CandidateKBEntryDto[]> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    const text = await this.extractTextFromPdf(file.buffer);
    const entries = await this.structureWithLLM(text);
    return entries;
  }

  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async structureWithLLM(text: string): Promise<CandidateKBEntryDto[]> {
    const openaiApiKey = this.configService.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new BadRequestException('OpenAI API key not configured for document processing');
    }

    const prompt = `Extract structured knowledge base entries from the following document text. Return a JSON array of objects with "title", "content", and "metadata" fields. Each entry should be a distinct piece of information (policy, FAQ, product info, etc.). Only return the JSON array.

Document text:
${text.slice(0, 15000)}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that extracts structured knowledge base entries from documents. Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return parsed.entries || parsed;
    } catch (error: any) {
      throw new BadRequestException(`Failed to process document: ${error.message}`);
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const provider = this.configService.get('EMBEDDING_PROVIDER') || 'openai';
    const apiKey = provider === 'openai' 
      ? this.configService.get('OPENAI_API_KEY')
      : this.configService.get('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      throw new BadRequestException(`${provider} API key not configured for embeddings`);
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.slice(0, 8000),
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI embedding error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } else {
      // Anthropic embeddings (if available)
      throw new BadRequestException('Anthropic embeddings not yet implemented');
    }
  }

  private async auditLog(
    orgId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    before: any,
    after: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        orgId,
        actorId: userId,
        actorType: 'user',
        action,
        resourceType,
        resourceId,
        before,
        after,
      },
    });
  }
}