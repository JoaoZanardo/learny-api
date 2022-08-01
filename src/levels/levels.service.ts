import { Injectable } from '@nestjs/common';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateLevelDto) {
    const exists = await this.findAll(data.name);
    if (exists) return null;

    return await this.prisma.level.create({ data });
  }

  async findAll(name?: string) {
    if (name) return await this.prisma.level.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });

    return await this.prisma.level.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.level.findFirst({ where: { id } });
  }

  async update(id: string, data: UpdateLevelDto) {
    const exists = await this.findAll(data.name);
    const level = await this.findOne(id);

    if (!level) return throwHttpResponse(404, 'level not found');
    if (exists && (data.name.toLowerCase()) !== (level.name.toLowerCase())) return throwHttpResponse(409, 'level already exists');

    const levelUpdated = await this.prisma.level.update({ where: { id }, data });
    return { statusCode: 200, level: levelUpdated };
  }

  async remove(id: string) {
    const level = await this.findOne(id);
    if (!level) return null;

    return await this.prisma.level.delete({ where: { id } });
  }
}
