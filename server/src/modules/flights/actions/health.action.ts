import type { Request, Response } from 'express';

/**
 * GET
 * Method to check module is alive
 *
 * @param _req
 * @param res
 */
export const healthAction = async (_req: Request, res: Response) => {
    return res.sendStatus(200);
};
