from pr.models.choices import QuestionType

AnswerResponse = {
    QuestionType.RATE: [i for i in range(1, 6)],
    QuestionType.YES_NO: [1, 0],
}
