import { Controller } from '@nestjs/common';
import { AdminService } from '../admin.service';

@Controller('admin')
export class AdminTaskUserController {
  constructor(private readonly adminService: AdminService) {}
}
