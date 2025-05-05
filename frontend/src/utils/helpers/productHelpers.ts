// src/utils/helpers/productHelpers.ts

import { SpecificationField } from "../types/ProductType";

export const parseSpecificationsJson = (
  specificationsJson: string
): SpecificationField[] => {
  try {
    const specs = JSON.parse(specificationsJson);
    const specFieldsArray: SpecificationField[] = Object.entries(specs).map(
      ([key, value]) => ({
        key,
        value: value as string,
        id: Math.random().toString(36).substr(2, 9),
      })
    );
    return specFieldsArray.length > 0
      ? specFieldsArray
      : [{ key: "", value: "", id: Math.random().toString(36).substr(2, 9) }];
  } catch (error) {
    console.error("Failed to parse specifications:", error);
    return [
      { key: "", value: "", id: Math.random().toString(36).substr(2, 9) },
    ];
  }
};

export const createSpecificationsJson = (
  specFields: SpecificationField[]
): string => {
  const specificationsObject: Record<string, string> = {};
  specFields.forEach((field) => {
    if (field.key.trim() !== "") {
      specificationsObject[field.key.trim()] = field.value.trim();
    }
  });
  return JSON.stringify(specificationsObject);
};
