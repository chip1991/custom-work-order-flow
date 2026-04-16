import type { NextFunction, Request, Response } from "express";

export function asyncHandler<
  Req extends Request = Request,
  Res extends Response = Response,
  Next extends NextFunction = NextFunction
>(fn: (req: Req, res: Res, next: Next) => Promise<unknown>) {
  return (req: Req, res: Res, next: Next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
