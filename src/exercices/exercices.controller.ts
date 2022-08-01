import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
  Res
} from '@nestjs/common';
import { ExercicesService } from './exercices.service';
import { CreateExerciceDto } from './dto/create-exercice.dto';
import { UpdateExerciceDto } from './dto/update-exercice.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request, Response } from 'express';
import { unlink } from 'fs/promises';
import { getAnswers } from './helpers/getAnswers';
import { verifyId } from './helpers/verifyId';
import { idCallbackFactory } from './helpers/idCallbackFactory';
import { validBody } from './helpers/validBody';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsAdminAuthGuard } from 'src/auth/guards/is-admin-auth.guard';
import { throwHttpResponse } from 'src/helpers/throwHttpResponse.ts';

@Controller('exercices')
export class ExercicesController {
  constructor(private readonly exercicesService: ExercicesService) { }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @UseInterceptors(FilesInterceptor('avatar', 3, {
    storage: diskStorage({
      destination: './public/media',
      filename: (req, file, cb) => {
        const rand = Math.floor(Math.random() * 1000);
        cb(null, `${Date.now() + rand}.png`);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowed: string[] = ['image/jpg', 'image/jpeg', 'image/png'];
      cb(null, allowed.includes(file.mimetype));
    }
  }))
  @Post()
  async create(@Body() body: CreateExerciceDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    try {
      const validBodyResponse = validBody(body);
      if (validBodyResponse.statusCode === 400) {
        for (const i of files) {
          await unlink(`C:/Users/User/Desktop/learny-api/public/media/${i.filename}`);
        }
        return validBodyResponse;
      }

      const subjectIdCallback = idCallbackFactory(body.subject_id, 'Invalid subject id');
      const levelIdCallback = idCallbackFactory(body.level_id, 'Invalid level id');
      const idCallbackField = [subjectIdCallback, levelIdCallback];

      for (const i of idCallbackField) {
        const verifyIdResponse = await verifyId(i.id, i.message, files);
        if (verifyIdResponse.statusCode === 400) return verifyIdResponse;
      }

      const answers = getAnswers(body.answer1, body.answer2, body.answer3, body.answer4, body.answer5);

      const images: string[] = [];
      for (const i of files) {
        images.push(i.filename.replace('.png', ''));
      };

      const data = {
        title: body.title,
        subTitle: body.subTitle,
        images,
        answers,
        correctAnswerIndex: parseInt(body.correctAnswerIndex),
        level_id: body.level_id,
        subject_id: body.subject_id,
        published: Boolean(parseInt(body.published))
      };

      const serviceResponse = await this.exercicesService.create(data);

      if (serviceResponse.statusCode === 400 || serviceResponse.statusCode === 404) {
        for (const i of files) {
          await unlink(`C:/Users/User/Desktop/learny-api/public/media/${i.filename}`);
        }
        return serviceResponse;
      }

      return serviceResponse;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Get('/getList/:params?')
  async findAll(@Req() req: Request) {
    try {
      const exercices = await this.exercicesService.findAll(req.query);
      return { statusCode: 200, exercices };
    } catch (e) {
      throw new Error(e);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid exercice id');

      const exercice = await this.exercicesService.findOne(id);
      if (!exercice) return throwHttpResponse(404, 'Exercice not found');

      return { statusCode: 200, exercice };
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @UseInterceptors(FilesInterceptor('avatar', 3, {
    storage: diskStorage({
      destination: './public/media',
      filename: (req, file, cb) => {
        const rand = Math.floor(Math.random() * 1000);
        cb(null, `${Date.now() + rand}.png`);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowed: string[] = ['image/jpg', 'image/jpeg', 'image/png'];
      cb(null, allowed.includes(file.mimetype));
    }
  }))
  @Post(':id')
  async update
    (
      @Param('id') id: string,
      @Body() body: UpdateExerciceDto,
      @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
    try {
      const validBodyObjResponse = validBody(body);
      if (validBodyObjResponse.statusCode === 400) {
        for (const i of files) {
          await unlink(`C:/Users/User/Desktop/learny-api/public/media/${i.filename}`);
        }
        return validBodyObjResponse;
      }

      const exerciceIdCallback = idCallbackFactory(id, 'Invalid exercice id');
      const subjectIdCallback = idCallbackFactory(body.subject_id, 'Invalid subject id');
      const levelIdCallback = idCallbackFactory(body.level_id, 'Invalid level id');
      const idCallbackField = [exerciceIdCallback, subjectIdCallback, levelIdCallback];

      for (const i of idCallbackField) {
        const verifyIdResponse = await verifyId(i.id, i.message, files);
        if (verifyIdResponse.statusCode === 400) return verifyIdResponse
      }

      const answers = getAnswers(body.answer1, body.answer2, body.answer3, body.answer4, body.answer5);

      const images: string[] = [];
      for (const i of files) {
        images.push(i.filename.replace('.png', ''));
      };

      const data = {
        title: body.title,
        subTitle: body.subTitle,
        images,
        answers,
        correctAnswerIndex: parseInt(body.correctAnswerIndex),
        level_id: body.level_id,
        subject_id: body.subject_id
      }

      const serviceResponse = await this.exercicesService.update(id, data);

      if (serviceResponse.statusCode === 400 || serviceResponse.statusCode === 404) {
        for (const i of files) {
          await unlink(`C:/Users/User/Desktop/learny-api/public/media/${i.filename}`);
        }
        return serviceResponse;
      }

      return serviceResponse;
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard, IsAdminAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      if (id.length !== 24) return throwHttpResponse(400, 'Invalid exercice id');

      const exercice = await this.exercicesService.remove(id);
      if (!exercice) return throwHttpResponse(404, 'Exercice not found');

      return throwHttpResponse(204, 'Exercice deleted successfully');
    } catch (e) {
      throw new Error(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get('done/:exercice_id/:answerIndex')
  async done(
    @Param('exercice_id') exercice_id: string,
    @Param('answerIndex') answerIndex: string,
    @Req() req: any
  ) {
    if (req.user) {
      if (exercice_id.length !== 24) return throwHttpResponse(404, 'Invalid exercice id');

      return await this.exercicesService.done(req.user.id, exercice_id, parseInt(answerIndex));
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get('done/getList')
  async getDoneExercices(@Req() req: any) {
    return await this.exercicesService.getDoneExercices(req.user.id);
  }
}
