import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express 4 does NOT catch rejections from async route handlers: a thrown error
 * inside `async (req, res) => {...}` becomes an unhandled promise rejection and
 * the request hangs until the client times out — the global error handler is
 * never reached.
 *
 * Wrap every async handler with this so rejections are forwarded to `next(err)`
 * and handled by the global error middleware.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
