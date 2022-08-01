import { unlink } from "fs/promises";

export const verifyId = async (id: string, message: string, files?: Array<Express.Multer.File>) => {
    if (id.length !== 24) {
        for (const i of files) {
            await unlink(`C:/Users/User/Desktop/learny-api/public/media/${i.filename}`);
        }

        return { statusCode: 400, message };
    }

    return { statusCode: 200 };
}