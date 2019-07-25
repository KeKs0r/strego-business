import { omitBy, isUndefined } from "lodash";

export default function cleanObject(obj: object): object {
  return omitBy(obj, isUndefined);
}
