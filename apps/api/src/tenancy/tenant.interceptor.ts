import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TenantContextService, TENANT_CONTEXT_KEY } from './tenant-context.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantContextService: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantContext = this.tenantContextService.getContext(request);

    if (tenantContext) {
      this.tenantContextService.setContext(tenantContext.orgId, tenantContext.userId, tenantContext.role);
    }

    return next.handle().pipe(
      finalize(async () => {
        if (tenantContext) {
          await this.tenantContextService.clearContext();
        }
      }),
    );
  }
}