import { Doctor } from "@prisma/client";

declare module 'express-serve-static-core' {
  interface Request {
    doctor?: Partial<Doctor>
  }
}
