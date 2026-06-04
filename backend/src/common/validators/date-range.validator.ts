import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAfterOrEqual(property: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isAfterOrEqual',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedProperty] = args.constraints;
          const related = (args.object as Record<string, unknown>)[
            relatedProperty
          ];
          if (typeof value !== 'string' || typeof related !== 'string') {
            return true;
          }
          return new Date(value).getTime() >= new Date(related).getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser posterior o igual a ${args.constraints[0]}`;
        },
      },
    });
  };
}
