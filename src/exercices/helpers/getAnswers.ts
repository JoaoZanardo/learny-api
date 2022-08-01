export const getAnswers = (answer1: string, answer2: string, answer3: string, answer4: string, answer5: string) => {
    const answers = [answer1, answer2];

    if (answer3) answers.push(answer3);
    if (answer4) answers.push(answer4);
    if (answer5) answers.push(answer5);

    return answers;
}