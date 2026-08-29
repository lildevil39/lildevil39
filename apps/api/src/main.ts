import "reflect-metadata";
import express from "express";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";

async function bootstrap() {
  // bodyParser: false so we can give payment webhooks the raw Buffer their
  // signature verification needs, before the global JSON parser runs.
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.use(cookieParser());
  app.use("/api/v1/payments/webhook", express.raw({ type: "*/*" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new HttpExceptionFilter());

  const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",");
  app.enableCors({ origin: corsOrigins, credentials: true });

  const port = process.env.API_PORT ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`NIVORA API listening on http://localhost:${port}/api/v1`);
}

bootstrap();
