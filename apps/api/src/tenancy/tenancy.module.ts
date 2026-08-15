import { Module } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { TenantInterceptor } from './tenant.interceptor';

@Module({
  providers: [TenantContextService, TenantInterceptor],
  exports: [TenantContextService, TenantInterceptor],
})
export class TenancyModule {}