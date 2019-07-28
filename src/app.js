import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import db from './store';
import twitterClient from 'twitter-node-client';

import indexRouter from './routes/index';
import usersRouter from './routes/users';

const app = express();

const Twitter = twitterClient.Twitter;

const twitterConfig = {
	"consumerKey": process.env.TWITTER_CONSUMER_KEY,
	"consumerSecret": process.env.TWITTER_CONSUMER_SECRET,
	"accessToken": process.env.TWITTER_ACCESS_TOKEN,
	"accessTokenSecret": process.env.TWITTER_ACCESS_TOKEN_SECRET
}
const twitter = new Twitter(twitterConfig);

const onError = (err, response, body) => {
  console.log(err);
}

const onSuccess = (data) => {
  let links = db.get('links');
  const newEntries = JSON.parse(data);

  newEntries.forEach((newEntry) => {
    const urls = newEntry.entities.urls;
    const hasUrls = urls.length > 0;

    if(hasUrls) {
      const link = {
        url: urls[0].expanded_url,
        created_at: newEntry.created_at,
        post_id: newEntry.id
      }

      links.push(link)
    }
  });

  console.log(links);

  // TUKI NEKI NI ŠE DOBR, SE NE SHRAN!
  // links.sortBy(['created_at']);
  links.write();
}

const getHomeTimeline = () => {
  const links = db.get('links');
  const hasLinks = !links.isEmpty().value();

  const query = {
    screen_name: 'youremartinets',
    count: '200',
  }

  if(hasLinks) {
    query.since_id = links.value()[0].post_id
  }

  twitter.getHomeTimeline(query, onError, onSuccess);
}

setInterval(getHomeTimeline, 30 * 1000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
