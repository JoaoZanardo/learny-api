import { Injectable } from '@nestjs/common';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateSubjectDto) {
    const exists = await this.findAll(data.name);
    if (exists) return null;

    return await this.prisma.subject.create({ data });
  }

  async findAll(name?: string) {
    if (name) return await this.prisma.subject.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
    
    return await this.prisma.subject.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.subject.findFirst({ where: { id } });
  }

  async update(id: string, data: UpdateSubjectDto) {
    const exists = await this.findAll(data.name);
    const subject = await this.findOne(id);

    if (!subject) return throwHttpResponse(404, 'Subject not found');
    if (exists && (data.name.toLowerCase()) !== (subject.name.toLowerCase())) return throwHttpResponse(409, 'Subject already exists');

    const subjectUpdated = await this.prisma.subject.update({ where: { id }, data });
    return { statusCode: 200, subject: subjectUpdated };
  }

  async remove(id: string) {
    const subject = await this.findOne(id);
    if (!subject) return null;

    return await this.prisma.subject.delete({ where: { id } });
  }
}
