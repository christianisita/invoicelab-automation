import { generateMock } from '@anatine/zod-mock'
import { faker } from '@faker-js/faker'
import { z } from 'zod'

const FIELD_FAKER_MAP: Record<string, () => string> = {
  address:     () => faker.location.streetAddress(),
  street:      () => faker.location.streetAddress(),
  city:        () => faker.location.city(),
  state:       () => faker.location.state(),
  country:     () => faker.location.country(),
  zipCode:     () => faker.location.zipCode(),
  postalCode:  () => faker.location.zipCode(),
  phone:       () => faker.phone.number(),
  phoneNumber: () => faker.phone.number(),
  name:        () => faker.person.fullName(),
  firstName:   () => faker.person.firstName(),
  lastName:    () => faker.person.lastName(),
  company:     () => faker.company.name(),
  description: () => faker.lorem.sentence(),
  notes:       () => faker.lorem.sentence(),
}

export type FactoryOptions<T> = {
  override?: Partial<T>
  useRandom?: boolean
  sendFullPayload?: boolean
  fieldFakers?: Partial<Record<keyof T & string, () => string>>
}

function mandatoryMock<T extends z.AnyZodObject>(
  schema: T,
  resolvedMap: Record<string, () => string>
): Partial<z.infer<T>> {
  const result: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(schema.shape as Record<string, z.ZodTypeAny>)) {
    const isOptional = field instanceof z.ZodOptional || field instanceof z.ZodNullable
    if (!isOptional) {
      result[key] = resolvedMap[key]?.() ?? generateMock(field)
    }
  }
  return result as Partial<z.infer<T>>
}

export function createPayloadFactory<T extends z.AnyZodObject>(schema: T) {
  return (opts: FactoryOptions<z.infer<T>> = {}): z.infer<T> => {
    const { override = {}, useRandom = true, sendFullPayload = false, fieldFakers = {} } = opts
    const resolvedMap = { ...FIELD_FAKER_MAP, ...fieldFakers } as Record<string, () => string>
    const base = useRandom
      ? sendFullPayload
        ? generateMock(schema, { stringMap: resolvedMap })
        : mandatoryMock(schema, resolvedMap)
      : {}
    return { ...base, ...override } as z.infer<T>
  }
}
