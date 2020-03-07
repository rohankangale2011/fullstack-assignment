import express, {Application} from 'express';
import redis from 'redis';
import cors from 'cors';
import { corsConfig } from './config/app.config';

class App {
  public app: Application;
  public port: number;
  public routes: any;
  public middlewares: any;
  public redisClient: any;

  constructor(appInit: { port: number, controllers: any, middlewares: any }) {
    this.app = express();
    this.port = appInit.port;
    this.initMiddlewares(appInit.middlewares);
    this.initRoutes(appInit.controllers);
    this.app.use(cors(corsConfig));
  }

  /**
   * Function setting all the provided routes
   * @param {Array} routes
   */
  public initRoutes(routes: any) {
    routes.forEach((routeController: any) => {
      this.app.use(routeController.route, routeController.controller.router);
    });
  }

  /**
   * Function setting up all the provided middlewares
   * @param {Array} middleWares
   */
  private initMiddlewares(middleWares: any) {
    middleWares.forEach((middleWare: any) => {
      this.app.use(middleWare);
    });
  }

  /**
   * Function initiating app listening/up process
   */
  public listen() {
    this.app.listen(this.port, () => {
      // tslint:disable-next-line:no-console
      console.log(`App listening on the given PORT: ${this.port}`);
    });
  }
}

export default App;