import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

@Injectable()
export class IsAdminAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext,): boolean {
		const user: User = context.switchToHttp().getRequest().user;
		return user.isAdmin;
  }
}