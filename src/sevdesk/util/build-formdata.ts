import * as FormData from "form-data";
import * as _ from "lodash";

function _buildFormData(
  formData: FormData,
  data: { [index: string]: any },
  parentKey?: string
) {
  if (data && typeof data === "object" && !(data instanceof Date)) {
    Object.keys(data).forEach((key: string) => {
      _buildFormData(
        formData,
        data[key],
        parentKey ? `${parentKey}[${key}]` : key
      );
    });
  } else if (parentKey) {
    const value = data === null ? "" : data;
    formData.append(parentKey, value);
  } else {
    console.warn("I think I should not happen");
  }
}

function _buildFormDataObject(
  formData: { [index: string]: any },
  data: { [index: string]: any },
  parentKey?: string
) {
  if (data && typeof data === "object" && !(data instanceof Date)) {
    Object.keys(data).forEach((key: string) => {
      _buildFormDataObject(
        formData,
        data[key],
        parentKey ? `${parentKey}[${key}]` : key
      );
    });
  } else if (parentKey) {
    const value = data === null ? "" : data;
    formData[parentKey] = value;
  } else {
    console.warn("I think I should not happen");
  }
}

export function json2formdatastring(json: Object) {
  const flattened = {};
  _buildFormDataObject(flattened, json);
  const formDataString = _.map(
    flattened,
    (value, key) => `${key}=${value}`
  ).join("&");
  return formDataString;
}

export default function json2formdata(json: Object) {
  let obj = {};
  const formData = new FormData();
  if (typeof json === "string") {
    try {
      obj = JSON.parse(json);
    } catch (err) {
      console.error(err);
    }
  } else if (typeof json === "object") {
    obj = json;
  }

  _buildFormData(formData, obj);
  return formData;
}
