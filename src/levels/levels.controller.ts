import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';

@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) { }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Post()
  async create(@Body(new ValidationPipe()) body: CreateLevelDto) {
    try {
      const level = await this.levelsService.create(body);
      if (!level) return throwHttpResponse(409, 'This level already exists');

      return { statusCode: 201, level };
    } catch (e) {
      throw new Error(e);
    }
  }

  @Get()
  async findAll() {
    try {
      const levels = await this.levelsService.findAll();
      return { statusCode: 200, levels };
    } catch (e) {
      throw new Error(e);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid level id');

      const level = await this.levelsService.findOne(id);
      if (!level) return throwHttpResponse(404, 'Level not found');

      return { statusCode: 200, level };
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe()) body: UpdateLevelDto) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid level id');

      return await this.levelsService.update(id, body);
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid level id');

      const level = await this.levelsService.remove(id);
      if (!level) return throwHttpResponse(404, 'Level not found');

      return throwHttpResponse(204, 'Level deleted successfully');
    } catch (e) {
      throw new Error(e);
    }
  }
}
