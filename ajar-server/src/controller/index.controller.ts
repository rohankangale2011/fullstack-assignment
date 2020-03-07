import * as express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import {corsConfig, client} from '../config/app.config';
import {getIBANSpecification, getIBANStatusData} from '../service';
import { BALANCE, DEFALUT_BALANCE } from '../config/constants';

class MainController {
  public router = express.Router();

  constructor() {
    this.initRoutes();
    this.setInitValues();
  }

  setInitValues() {
    client.set(BALANCE, process.env.BALANCE || DEFALUT_BALANCE);
  }

  public initRoutes() {
    this.router.use(cors(corsConfig));
    this.router.get('/balance', this.balance);
    this.router.get('/iban/specification/:id', this.ibanSpecification);
    this.router.get('/bank/:id', this.bank);
    this.router.post('/transfer/:amount', this.transfer);
  }

  /**
   * Function providing the initial balance details
   * @param {Request} req
   * @param {Response} res
   */
  balance = (req: Request, res: Response) => {
    client.get(BALANCE, (err: any, balance: string) => {
      res.json({
        code: 200,
        data: {
          balance: err ? process.env.BALANCE : balance
        }
      });
    });
  };

  /**
   * Function providing the initial balance details
   * @param {Request} req
   * @param {Response} res
   */
  ibanSpecification = async (req: Request, res: Response) => {
    const isValid = await getIBANSpecification(req.params.id);
    res.json({
      code: 200,
      data: isValid
    });
  };

  /**
   * Function providing the bank details for prodived IBAN number
   * @param {Request} req
   * @param {Response} res
   */
  bank = async (req: Request, res: Response) => {
    const data = await getIBANStatusData(req.params.id);
    res.json(data);
  };

  /**
   * Function handling amount transfer
   * @param {Request} req
   * @param {Response} res
   */
  transfer = (req: Request, res: Response) => {
    client.get(BALANCE, (err: any, balance: any) => {
      if (err) {
        res.json({
          code: 402,
          error: {
            status: 'Bad Request',
            message: 'Insufficient funds.'
          }
        });
      } else {
        const isValidTransaction = req.body.amount <= parseFloat(balance);
        if (isValidTransaction) {
          const newBalance = balance - req.body.amount;
          client.set(BALANCE, newBalance.toString());
          res.json({
            code: 202
          });
        } else {
          res.json({
            code: 402,
            error: {
              status: 'Bad Request',
              message: 'Insufficient funds.'
            }
          });
        }
      }
    });
  };
}

export default MainController;