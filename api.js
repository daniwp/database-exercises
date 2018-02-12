import express from 'express';
import Api from './db';

const port = 8081;
const app = express();

app.listen(port);

app.get('/users/count', (req, res) => {
    getResultAsJSON(Api.getCount, res)
});

app.get('/top/linked', (req, res) => {
    getResultAsJSON(Api.getTop10MostLinking, res)
});

app.get('/top/grumpy', (req, res) => {
    getResultAsJSON(Api.getTop5MostGrumpy, res)
});

app.get('/top/happy', (req, res) => {
    getResultAsJSON(Api.getTop5MostHappy, res)
});

app.get('/top/active', (req, res) => {
    getResultAsJSON(Api.getTop10MostActive, res)
});

app.get('/top/mentioned', (req, res) => {
    getResultAsJSON(Api.getTop10MostMentioned, res)
});

function getResultAsJSON(call, res) {
    call().then(result => {
        res.end(JSON.stringify(result));
    }).catch(err => {
        res.end(JSON.stringify(err));
    });
}