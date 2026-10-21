export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(code: string, message: string, details?: unknown) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = "Sessão inválida ou expirada.") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Você não tem acesso a este recurso.") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Recurso não encontrado.") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(code: string, message: string) {
    return new ApiError(409, code, message);
  }

  static tooManyRequests(message = "Muitas requisições. Tente novamente em instantes.") {
    return new ApiError(429, "RATE_LIMITED", message);
  }
}
