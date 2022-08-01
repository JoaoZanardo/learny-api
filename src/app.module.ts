import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { ExercicesModule } from './exercices/exercices.module';
import { AuthModule } from './auth/auth.module';
import { LevelsModule } from './levels/levels.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    UsersModule, 
    PrismaModule, 
    ExercicesModule, 
    AuthModule, LevelsModule, SubjectsModule,
  ],
})
export class AppModule {}
