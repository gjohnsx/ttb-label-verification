import { parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs/server";
import {
  APPLICATION_STATUSES,
  CLASS_TYPES,
  type ApplicationStatusValue,
  type ClassTypeValue,
} from "@/lib/constants";

const STATUS_VALUES = APPLICATION_STATUSES.map(
  (status) => status.value
) as ApplicationStatusValue[];
const CLASS_TYPE_VALUES = CLASS_TYPES.map(
  (classType) => classType.value
) as ClassTypeValue[];

export const queueParsers = {
  status: parseAsArrayOf(parseAsStringLiteral(STATUS_VALUES))
    .withDefault([])
    .withOptions({ shallow: false }),
  classType: parseAsArrayOf(parseAsStringLiteral(CLASS_TYPE_VALUES))
    .withDefault([])
    .withOptions({ shallow: false }),
  search: parseAsString
    .withDefault("")
    .withOptions({ shallow: false }),
  ids: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions({ shallow: false }),
};
