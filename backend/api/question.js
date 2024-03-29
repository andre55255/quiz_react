const db = require("../database/db");
const validationAnswer = require("../validation/isCorrectAnswer");

function newQuestion() {
    return function (req, res) {
        const { 
            quiz,
            question,
            answer1,
            isCorrect1,
            answer2,
            isCorrect2,
            answer3,
            isCorrect3,
            answer4,
            isCorrect4,
        } = req.body;

        const { idUser } = req.user;

        if (!quiz || !question ||
            !answer1 || !(isCorrect1 || !isCorrect1) ||
            !answer2 || !(isCorrect2 || !isCorrect2) ||
            !answer3 || !(isCorrect3 || !isCorrect3) ||
            !answer4 || !(isCorrect4 || !isCorrect4)
        ) return res.status(400).send({ error: "Data not reported" });

        if (!validationAnswer(isCorrect1, isCorrect2, isCorrect3, isCorrect4))
            return res.status(400).send({ error: "There should be only one correct answer" });

        db.transaction(async trans => {
            try {
                const idQuiz = await trans.select("*")
                                            .table("quiz")
                                            .where({
                                                id_user: idUser,
                                                name: quiz
                                            });

                if (idQuiz.length < 1) return res.status(404).send({ error: "Quiz not found" });

                const idQuestion = await trans.insert({ description: question })
                                                .into("question")
                                                .returning("id");

                const idsAnswersCorrects = await trans.insert([
                    { description: answer1, is_correct: isCorrect1 },
                    { description: answer2, is_correct: isCorrect2 },
                    { description: answer3, is_correct: isCorrect3 },
                    { description: answer4, is_correct: isCorrect4 }
                ])
                .into("answer")
                .returning("id");

                await trans.insert([
                    { id_question: idQuestion[0], id_quiz: idQuiz[0].id, id_answer: idsAnswersCorrects[0] },
                    { id_question: idQuestion[0], id_quiz: idQuiz[0].id, id_answer: idsAnswersCorrects[1] },
                    { id_question: idQuestion[0], id_quiz: idQuiz[0].id, id_answer: idsAnswersCorrects[2] },
                    { id_question: idQuestion[0], id_quiz: idQuiz[0].id, id_answer: idsAnswersCorrects[3] },
                ])
                .into("quiz_question")
                
                return res.status(201).send({ message: "Question created successfully" });
            } catch (err) {
                console.log(err);
                return res.status(500).send({ error: "Internal server error" });
            }
        });
    }
}

function allQuestionsByQuizByUser() {
    return function (req, res) {
        const { idUser } = req.user;
        const { quiz } = req.query;

        if (!idUser || !quiz) return res.status(400).send({ error: "Data not reported" });

        db.transaction(async trans => {
            try {
                const idQuiz = await trans.select("*")
                                            .table("quiz")
                                            .where({
                                                id_user: idUser,
                                                name: quiz
                                            });
    
                if (idQuiz.length < 1) return res.status(404).send({ error: "Quiz not found" });
    
                const data = await trans.select([
                    "question.description as question",
                    "answer.description as answer",
                    "answer.is_correct as isCorrect",
                    "quiz.name as quiz",
                    "category.description as category"
                ])
                .table("quiz_question")
                .innerJoin("question", "quiz_question.id_question", "question.id")
                .innerJoin("answer", "quiz_question.id_answer", "answer.id")
                .innerJoin("quiz", "quiz_question.id_quiz", "quiz.id")
                .innerJoin("category", "quiz.id_category", "category.id")
                .where({
                    "quiz.id": idQuiz[0].id
                });
    
                if (data.length < 1) return res.status(404).send({ error: "Questions not found" });

                return res.status(200).send(data);
            } catch (err) {
                console.log(err);
                return res.status(500).send({ error: "Internal server error" });
            }
        });
    }
}

module.exports = {
    newQuestion,
    allQuestionsByQuizByUser,
}