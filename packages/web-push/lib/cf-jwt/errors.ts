/* eslint-disable max-classes-per-file */
import { CustomError, Status } from '@block65/custom-error';

export class PermissionError extends CustomError {
  public override code = Status.PERMISSION_DENIED;
}

export class ValidationError extends CustomError {
  public override code = Status.PERMISSION_DENIED;
}
