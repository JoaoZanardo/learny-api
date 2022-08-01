import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) { }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Post()
  async create(@Body(new ValidationPipe()) body: CreateSubjectDto) {
    try {
      const subject = await this.subjectsService.create(body);
      if (!subject) return throwHttpResponse(409, 'This subject already exists' );

      return { statusCode: 201, subject };
    } catch (e) {
      throw new Error(e);
    }
  }

  @Get()
  async findAll() {
    try {
      const subjects = await this.subjectsService.findAll();
      return { statusCode: 200, subjects };
    } catch (e) {
      throw new Error(e);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid subject id');

      const subject = await this.subjectsService.findOne(id);
      if (!subject) return throwHttpResponse(404, 'Subject not found');

      return { statusCode: 200, subject };
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe()) body: UpdateSubjectDto) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid subject id');

      return await this.subjectsService.update(id, body);
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid subject id');

      const subject = await this.subjectsService.remove(id);
      if (!subject) return throwHttpResponse(404, 'Subject not found');

      return throwHttpResponse(204, 'Subject deleted successfully');
    } catch (e) {
      throw new Error(e);
    }
  }
}
