interface Option {
  cause: unknown;
  name?: string;
}

/**
 * Small compat layer for https://deno.land/x/lume@v1/core/errors.ts
 */
export class Exception extends Error {
  readonly filename?: string;
  constructor(message?: string, option?: Option) {
    super(message, option);
    this.filename = option?.name;
  }
}
