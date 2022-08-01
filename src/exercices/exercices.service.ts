import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExerciceDto } from './dto/create-exercice.dto';
import { UpdateExerciceDto } from './dto/update-exercice.dto';
import { Exercice } from './entities/exercice.entity';
import { IExerciceQuery } from './interfaces/exerciceQueryInterface';

@Injectable()
export class ExercicesService {
  constructor(
    private readonly prisma: PrismaService) { }

  async create(data: Exercice) {
    const level = await this.prisma.level.findFirst({ where: { id: data.level_id } });
    const subject = await this.prisma.subject.findFirst({ where: { id: data.subject_id } });

    if (!level) return throwHttpResponse(404, 'Level not found');
    if (!subject) return throwHttpResponse(404, 'Subject not found');

    if (data.correctAnswerIndex < 0 || data.correctAnswerIndex > data.answers.length - 1) return throwHttpResponse(400, 'Invalid correct answer index');

    const exercice = await this.prisma.exercice.create({ data });
    return { statusCode: 201, exercice };
  }

  async findAll(query: IExerciceQuery) {
    const { q, published, subject_id, level_id } = query;

    let filters = {};

    if (q) filters = { q };
    if (published && (published === '0' || published == '1')) filters = { ...filters, published: Boolean(parseInt(published)) };
    if (subject_id) filters = { ...filters, subject_id };
    if (level_id) filters = { ...filters, level_id };

    const rawExercices = await this.prisma.exercice.findMany({ where: filters });

    const exercices = [];
    for (const i of rawExercices) {
      const subject = await this.prisma.subject.findFirst({ where: { id: i.subject_id } });
      const level = await this.prisma.level.findFirst({ where: { id: i.level_id } });

      exercices.push({
        id: i.id,
        title: i.title,
        subject: subject.name,
        level: level.name,
        published: i.published
      });
    }

    return exercices;
  }

  async findOne(id: string) {
    const exercice = await this.prisma.exercice.findFirst({ where: { id } });
    if (!exercice) return null;

    const subject = await this.prisma.subject.findFirst({ where: { id: exercice.subject_id } });
    const level = await this.prisma.level.findFirst({ where: { id: exercice.level_id } });

    const images = [];
    for (const image of exercice.images) {
      images.push(`${process.env.BASE}/media/${image}.png`)
    }


    return {
      id: exercice.id,
      title: exercice.title,
      subTitle: exercice.subTitle,
      images,
      answers: exercice.answers,
      correctAnswerIndex: exercice.correctAnswerIndex,
      subject: subject.name,
      level: level.name,
      published: exercice.published
    }
  }

  async update(id: string, data: Exercice) {
    const exercice = await this.prisma.exercice.findFirst({ where: { id } });
    const level = await this.prisma.level.findFirst({ where: { id: data.level_id } });
    const subject = await this.prisma.subject.findFirst({ where: { id: data.subject_id } });

    if (!exercice) return throwHttpResponse(404, 'Exercice not found');
    if (!level) return throwHttpResponse(404, 'Level not found');
    if (!subject) return throwHttpResponse(404, 'Subject not found');
    if (data.correctAnswerIndex < 0 || data.correctAnswerIndex > data.answers.length - 1) return throwHttpResponse(400, 'Invalid correct answer index');

    for (const image of exercice.images) {
      await unlink(`C:/Users/User/Desktop/learny-api/public/media/${image}.png`);
    }

    const exerciceUpddated = await this.prisma.exercice.update({ where: { id }, data });
    return { statusCode: 200, exercice: exerciceUpddated };
  }

  async remove(id: string) {
    const exercice = await this.prisma.exercice.findFirst({ where: { id } });
    if (!exercice) return null;

    for (const image of exercice.images) {
      await unlink(`C:/Users/User/Desktop/learny-api/public/media/${image}.png`);
    }

    return await this.prisma.exercice.delete({ where: { id } });
  }

  async done(user_id: string, exercice_id: string, answerIndex: number) {
    const exercice = await this.prisma.exercice.findFirst({ where: { id: exercice_id } });
    const user = await this.prisma.user.findFirst({ where: { id: user_id } });

    if (!exercice) return throwHttpResponse(404, 'Exercice not found');
    if (!user) return throwHttpResponse(404, 'User not found');

    for (const i of user.done) {
      if (i.exercice_id === exercice.id) return throwHttpResponse(409, 'Already do this exercice');
    }

    if (answerIndex < 0 || answerIndex > (exercice.answers.length - 1)) return throwHttpResponse(400, 'Invalid correct answer index');

    let gotItRight = false;
    let points = user.points - 10
    if (answerIndex === exercice.correctAnswerIndex) {
      gotItRight = true;
      points = user.points + 10
    }

    const userDone = {
      exercice_id: exercice.id,
      userIndexAnswer: answerIndex,
      gotItRight
    }

    const done = [...user.done, userDone];

    await this.prisma.user.update({ where: { id: user_id }, data: { done, points } });
  }

  async getDoneExercices(user_id: string) {
    const user = await this.prisma.user.findFirst({ where: { id: user_id } });
    if (!user) return throwHttpResponse(404, 'User not found');

    const exercices = [];
    for (const i of user.done) {
      const exercice = await this.prisma.exercice.findFirst({ where: { id: i.exercice_id } });
      const subject = await this.prisma.subject.findFirst({ where: { id: exercice.subject_id } });
      const level = await this.prisma.level.findFirst({ where: { id: exercice.level_id } });

      exercices.push({
        id: exercice.id,
        title: exercice.title,
        subject: subject.name,
        level: level.name,
        gotItRight: i.gotItRight
      });
    }

    return exercices;
  }
}
