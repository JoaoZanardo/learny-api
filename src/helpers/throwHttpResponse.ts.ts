export const throwHttpResponse = (statusCode: number, message: any) => {
    return { statusCode, message };
};