import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { User as UserEntity }  from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt'
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail( email );
    if (!user) return null; 
    const isMatch = await bcrypt.compare(pass, user.password);
    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signup(data: UserEntity) {
    const user = await this.usersService.create(data);
    if (!user) return throwHttpResponse(409, 'Name or email already exists');

    return this.login(user);
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}