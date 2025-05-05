import { SpecificationField } from "../types/ProductType";

export const createMetadatasJson = (fields: SpecificationField[]): string => {
  const values = fields
    .map((field) => field.value.trim())
    .filter((value) => value !== "");

  const metadataObject = {
    name: values,
  };

  return JSON.stringify(metadataObject);
};
