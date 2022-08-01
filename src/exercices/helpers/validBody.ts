import { CreateExerciceDto } from "../dto/create-exercice.dto";

export const validBody = (body: CreateExerciceDto) => {
    let statusCode = 200;
    let message: string;
    if (!body.answer1 || !body.answer2) {
        statusCode = 400;
        message = 'A and B are necessary';
    }
    if (!body.title) {
        statusCode = 400;
        message = 'title should not be empty';
    }
    if (!body.correctAnswerIndex) {
        statusCode = 400;
        message = 'correct answer index should not be empty';
    }
    if (!body.level_id) {
        statusCode = 400;
        message = 'level_id should not be empty';
    }
    if (!body.subject_id) {
        statusCode = 400;
        message = 'subject_id should not be empty';
    }
    if (!body.published || (body.published !== '0' && body.published !== '1')) {
        statusCode = 400;
        message = 'invalid published value';
    }

    return { statusCode, message };
}