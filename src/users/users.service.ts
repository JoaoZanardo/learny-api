import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { IUserQuery } from './interface/query.interface';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: User) {
    const { nameExists, emailExists } = await this.exists(data.name, data.email);
    if (nameExists || emailExists) return null;

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data.password, salt);
    data.password = hash;

    const user = await this.prisma.user.create({ data });
    return user
  }

  async findAll(query: IUserQuery) {
    const { email, name, points } = query;

    let filters = {};
    if (email) filters = { email: { equals: email, mode: 'insensitive' } };
    if (name) filters = { ...filters, name: { equals: name, mode: 'insensitive' } };

    let rawUsers = []
    if (points === 'desc' || points === 'asc') {
      rawUsers = await this.prisma.user.findMany({ orderBy: { points: points } })
    } else {
      rawUsers = await this.prisma.user.findMany({ where: filters });
    }

    const users = [];
    for (const user of rawUsers) {
      users.push({
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
        isAdmin: user.isAdmin,
        created_at: user.created_at.toLocaleDateString('pt-br')
      });
    }

    return users;
  }

  async findOne(id: string) {
    return await this.prisma.user.findFirst({ where: { id } });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findFirst({ where: { email } });
  }

  async update(id: string, data: UpdateUserDto) {
    const { nameExists, emailExists } = await this.exists(data.name, data.email);
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) return throwHttpResponse(400, 'User not found');

    if (nameExists && data.name.toLowerCase() !== user.name.toLowerCase()) return throwHttpResponse(409, 'Name already exists');
    if (emailExists && data.email.toLowerCase() !== user.email.toLowerCase()) return throwHttpResponse(409, 'Email already exists');

    const userUpdated = await this.prisma.user.update({ where: { id }, data });
    return { statusCode: 200, user: userUpdated };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) return null;

    return await this.prisma.user.delete({ where: { id } });
  }

  async exists(name: string, email: string) {
    const [nameExists] = await this.findAll({ name });
    const emailExists = await this.findByEmail(email);

    return { nameExists, emailExists };
  }
}
