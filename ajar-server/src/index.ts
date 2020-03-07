import bodyParser from 'body-parser';
import MainController from './controller/index.controller';
import { APP_PORT } from './config/constants';
import App from './app';

const app = new App({
    port: APP_PORT,
    controllers: [
        {
            route: '/api/v1',
            controller: new MainController()
        }
    ],
    middlewares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true })
    ]
});

app.listen();