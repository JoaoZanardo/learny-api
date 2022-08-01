import { IsBoolean, IsNotEmpty, IsString } from "class-validator"

export class CreateExerciceDto {
    @IsNotEmpty()
    @IsString()
    title: string;
    @IsNotEmpty()
    @IsString()
    answer1: string
    @IsNotEmpty()
    @IsString()
    answer2: string
    @IsNotEmpty()
    @IsString()
    correctAnswerIndex: string;
    @IsNotEmpty()
    @IsString()
    subject_id: string;
    @IsNotEmpty()
    @IsString()
    level_id: string;
    @IsNotEmpty()
    @IsString()
    published: string;

    avatar: Array<Express.Multer.File>
    subTitle?: string;
    answer3?: string
    answer4?: string
    answer5?: string
}
