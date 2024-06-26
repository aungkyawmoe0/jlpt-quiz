const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const questions = require('./questions');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/question/0');
});

app.get('/question/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index < 0 || index >= questions.length) {
    return res.redirect('/result');
  }
  res.render('question', { question: questions[index], index, total: questions.length });
});

app.post('/answer', (req, res) => {
  const { index, answer } = req.body;
  const correct = questions[index].correctAnswer == answer;
  req.session.answers = req.session.answers || [];
  req.session.answers[index] = { answer: parseInt(answer), correct };
  const nextIndex = parseInt(index) + 1;
  if (nextIndex >= questions.length) {
    res.redirect('/result');
  } else {
    res.redirect(`/question/${nextIndex}`);
  }
});

app.get('/result', (req, res) => {
  const answers = req.session.answers || [];
  const score = answers.filter(ans => ans.correct).length;
  const pass = score >= questions.length * 0.6;
  res.render('result', { score, pass, total: questions.length, answers, questions });
});

app.post('/retry', (req, res) => {
  req.session.answers = [];
  res.redirect('/');
});

app.get('/purchase', (req, res) => {
  res.render('purchase');
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
