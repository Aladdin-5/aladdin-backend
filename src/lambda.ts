import serverless from 'serverless-http';
import { createNestApp } from './main';

export const handler = async (event, context) => {
  const app = await createNestApp();
  return serverless(app)(event, context);
};