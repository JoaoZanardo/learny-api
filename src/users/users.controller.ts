import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body(new ValidationPipe()) body: CreateUserDto) {
    try {
      if (body.password !== body.repeatPassword) return throwHttpResponse(400, 'The passwords need be equals');


      const data = {
        name: body.name,
        email: body.email,
        password: body.password
      }

      const user = await this.usersService.create(data);
      if (!user) return throwHttpResponse(409, 'Name or email already exists');

      return { statusCode: 201, user };
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Get('getList/:params?')
  async findAll(@Req() req: Request) {
    try {
      const users = await this.usersService.findAll(req.query);
      return { statusCode: 200, users };
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid user id');

      if (req.user.id === id || req.user.isAdmin) {
        const user = await this.usersService.findOne(id);
        if (!user) return throwHttpResponse(404, 'User not found');

        return { statusCode: 200, user };
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe()) body: UpdateUserDto, @Req() req: any) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid user id');

      if (req.user.id === id || req.user.isAdmin) {
        const errors = [];

        if (!body.name) errors.push('name should not be empty');
        if (!body.email) errors.push('email should not be empty');
        if (errors.length > 0) return throwHttpResponse(400, errors);

        return await this.usersService.update(id, body);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    if (id.length !== 24) return throwHttpResponse(400, 'Invalid user id');

    if (req.user.id === id || req.user.isAdmin) {
      const user = await this.usersService.remove(id);
      if (!user) return throwHttpResponse(404, 'User not found');

      return throwHttpResponse(204, 'User deleted successfully');
    }
  }
}
