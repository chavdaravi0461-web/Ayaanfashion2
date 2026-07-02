import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    const errorResponse: Record<string, any> = {
      success: false,
      statusCode: status,
      message: typeof message === 'string' ? message : message.message || message.error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = exception instanceof Error ? exception.stack : null;
    }

    this.logger.error(
      JSON.stringify({
        timestamp: errorResponse.timestamp,
        path: request.url,
        method: request.method,
        statusCode: status,
        message: errorResponse.message,
      }),
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
