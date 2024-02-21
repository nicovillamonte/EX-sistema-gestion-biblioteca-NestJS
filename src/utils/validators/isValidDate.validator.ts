import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator'

@ValidatorConstraint({ async: false })
class IsValidDateConstraint implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    return new Date(date).toString() !== 'Invalid Date'
  }

  defaultMessage(args: ValidationArguments) {
    return 'The date must be a valid ISO 8601 date string'
  }
}

export function IsValidDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDateConstraint,
    })
  }
}
