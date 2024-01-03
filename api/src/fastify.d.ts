import "fastify";

interface SessionPayload {
  exp: number;
  iat: number;
  sub: string;
  iss: string;
  jti: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  hasImage: boolean;
  meta: any;
}

declare module "fastify" {
  interface FastifyRequest {
    session?: SessionPayload;
  }
}
