import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  list() {
    return this.sessions.list();
  }

  @Post()
  async create(@Body() dto: { name: string; tenantId?: string }) {
    return this.sessions.create(dto.name, dto.tenantId);
  }

  @Post(':id/start')
  async start(@Param('id') id: string) {
    return this.sessions.start(id);
  }

  @Post(':id/stop')
  async stop(@Param('id') id: string) {
    return this.sessions.stop(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sessions.remove(id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.sessions.get(id);
  }

  @Get(':id/qr')
  qr(@Param('id') id: string) {
    return this.sessions.getQR(id);
  }
}
