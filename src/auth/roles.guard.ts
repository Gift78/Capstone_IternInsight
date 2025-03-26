import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    //console.log('Roles from @Roles:', roles);
    if (!roles) {
      return true; // หากไม่มี roles ที่กำหนดไว้ใน @Roles, อนุญาตให้เข้าถึง

    }

    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // ดึงข้อมูล user จาก request
    //console.log('User from JWT:', user);
    if (!user || !user.role) {
      return false; // หากไม่มี user หรือ role ใน request, ปฏิเสธการเข้าถึง
    }

    return roles.includes(user.role); // ตรวจสอบว่า role ของ user ตรงกับ roles ที่กำหนดหรือไม่
  }
}