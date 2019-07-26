import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import twitterClient from 'twitter-node-client';

import indexRouter from './routes/index';
import usersRouter from './routes/users';

const app = express();
const Twitter = twitterClient.Twitter;

const config = {
	"consumerKey": process.env.TWITTER_CONSUMER_KEY,
	"consumerSecret": process.env.TWITTER_CONSUMER_SECRET,
	"accessToken": process.env.TWITTER_ACCESS_TOKEN,
	"accessTokenSecret": process.env.TWITTER_ACCESS_TOKEN_SECRET
}
const twitter = new Twitter(config);

const onError = (err, response, body) => {
  console.log(err);
}
const onSuccess = (entries) => {
  JSON.parse(entries).forEach((entry) => {
    const urls = entry.entities.urls;
    const hasUrls = urls.length > 0;
    hasUrls && console.log(urls[0].expanded_url);
  });
}

twitter.getHomeTimeline({ screen_name: 'youremartinets', count: '200'}, onError, onSuccess);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
