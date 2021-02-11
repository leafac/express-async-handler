import { test, expect } from "@jest/globals";
import express from "express";
import fetch from "node-fetch";
import { asyncHandler, asyncErrorHandler } from ".";

test("Synchronous", async () => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.get<
    { exampleParameter: string },
    { exampleResponseBody: string },
    { exampleRequestBody: string },
    { exampleRequestQuery: string },
    { exampleLocals: string }
  >("/error/:exampleParameter", (req, res) => {
    // The following are no-ops that are just examples of using the types from the generics
    req.params.exampleParameter;
    if (false) res.send({ exampleResponseBody: "exampleResponseBody" });
    req.body.exampleRequestBody;
    req.query.exampleRequestQuery;
    res.locals.exampleLocals;

    throw new Error("Error from within the app");
  });

  app.use(((err, req, res, next) => {
    // The following are no-ops that are just examples of using the types from the generics
    req.params.exampleParameter;
    if (false) res.send({ exampleResponseBody: "exampleResponseBody" });
    req.body.exampleRequestBody;
    req.query.exampleRequestQuery;
    res.locals.exampleLocals;

    throw new Error(`Original error: ${err}`);
  }) as express.ErrorRequestHandler<{ exampleParameter: string }, { exampleResponseBody: string }, { exampleRequestBody: string }, { exampleRequestQuery: string }, { exampleLocals: string }>);

  const server = app.listen();
  const address = server.address();
  if (address === null || typeof address === "string")
    throw new Error("Invalid address");
  const port = address.port;

  await expect(
    await (await fetch(`http://localhost:${port}/error/hi`)).text()
  ).toMatch("Error: Original error: Error: Error from within the app");
  expect(server.listening).toBe(true);

  server.close();
});

test("Asynchronous", async () => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.get<
    { exampleParameter: string },
    { exampleResponseBody: string },
    { exampleRequestBody: string },
    { exampleRequestQuery: string },
    { exampleLocals: string }
  >(
    "/error/:exampleParameter",
    asyncHandler(async (req, res) => {
      await Promise.resolve();

      // The following are no-ops that are just examples of using the types from the generics
      req.params.exampleParameter;
      if (false) res.send({ exampleResponseBody: "exampleResponseBody" });
      req.body.exampleRequestBody;
      req.query.exampleRequestQuery;
      res.locals.exampleLocals;

      throw new Error("Error from within the app");
    })
  );

  app.use(
    asyncErrorHandler<
      { exampleParameter: string },
      { exampleResponseBody: string },
      { exampleRequestBody: string },
      { exampleRequestQuery: string },
      { exampleLocals: string }
    >(async (err, req, res, next) => {
      await Promise.resolve();

      // The following are no-ops that are just examples of using the types from the generics
      req.params.exampleParameter;
      if (false) res.send({ exampleResponseBody: "exampleResponseBody" });
      req.body.exampleRequestBody;
      req.query.exampleRequestQuery;
      res.locals.exampleLocals;

      throw new Error(`Original error: ${err}`);
    })
  );

  const server = app.listen();
  const address = server.address();
  if (address === null || typeof address === "string")
    throw new Error("Invalid address");
  const port = address.port;

  await expect(
    await (await fetch(`http://localhost:${port}/error/hi`)).text()
  ).toMatch("Error: Original error: Error: Error from within the app");
  expect(server.listening).toBe(true);

  server.close();
});
