import puppeteer from 'puppeteer';
import {countryIbanLookup} from '../config/app.config';

/**
 * Function prodiving curreny related data for the provided IBAN
 * @param {string} iban
 */
export const getIBANSpecification = async (iban: string) => {
  return new Promise((resolve: any, reject: any) => {
    for(const countryIban in countryIbanLookup)  {
      if (countryIban === iban) {
        resolve(countryIbanLookup[countryIban]);
      }
    }
    resolve(null);
  });
};

/**
 * Function providing IBAN status information(including bank name, logo)
 * @param {string} iban
 */
export const getIBANStatusData = async (iban: string) => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const ibanChecker = 'https://transferwise.com/us/iban/checker';
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(ibanChecker);
      await page.waitForSelector("input#iban-number");
      await page.focus('input[id="iban-number"]');
      await page.keyboard.type(iban);
      page.keyboard.press('Enter');

      let response;
      try {
        await page.waitForSelector("div.alert-warning", { timeout: 2000 });
        response = {
          code: 400,
          data: {}
        }
      } catch (error) {
        await page.waitForSelector('div.p-a-4');
        const links = await page.$$('div.p-a-4');
        const img = await links[0].$eval('img.bank-logo', (el) => el.getAttribute('src'));
        const bank = await links[0].$eval('img.bank-logo', (el) => el.getAttribute('alt'))
        response = {
          code: 200,
          data: {
            logo: `https://transferwise.com${img}`,
            bank
          }
        };
      }
      await browser.close();
      resolve(response);
    } catch(err) {
      resolve({
        code: 500,
        data: {}
      });
    }
  });
};