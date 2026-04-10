type FirestoreScalarField =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null };

interface FirestoreArrayField {
  arrayValue: {
    values?: FirestoreFieldValue[];
  };
}

interface FirestoreMapField {
  mapValue: {
    fields?: FirestoreFieldMap;
  };
}

type FirestoreFieldValue = FirestoreScalarField | FirestoreArrayField | FirestoreMapField;

interface FirestoreFieldMap {
  [key: string]: FirestoreFieldValue;
}

export interface FirestoreDocumentResponse {
  fields?: FirestoreFieldMap;
}

const isTimestampLike = (value: string): boolean => {
  const date = Date.parse(value);
  return Number.isFinite(date) && /\d{4}-\d{2}-\d{2}T/.test(value);
};

const toFirestoreValue = (value: unknown): FirestoreFieldValue => {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === 'string') {
    return isTimestampLike(value) ? { timestampValue: value } : { stringValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreValue(item))
      }
    };
  }

  if (typeof value === 'object') {
    const objectFields = Object.entries(value as Record<string, unknown>).reduce<FirestoreFieldMap>((acc, [key, nested]) => {
      acc[key] = toFirestoreValue(nested);
      return acc;
    }, {});

    return {
      mapValue: {
        fields: objectFields
      }
    };
  }

  return { stringValue: String(value) };
};

export const toFirestoreFields = <T extends object>(document: T): FirestoreFieldMap =>
  Object.entries(document).reduce<FirestoreFieldMap>((acc, [key, value]) => {
    acc[key] = toFirestoreValue(value);
    return acc;
  }, {});

const fromFirestoreValue = (value: FirestoreFieldValue): unknown => {
  if ('stringValue' in value) {
    return value.stringValue;
  }

  if ('timestampValue' in value) {
    return value.timestampValue;
  }

  if ('booleanValue' in value) {
    return value.booleanValue;
  }

  if ('integerValue' in value) {
    return Number(value.integerValue);
  }

  if ('doubleValue' in value) {
    return value.doubleValue;
  }

  if ('nullValue' in value) {
    return null;
  }

  if ('arrayValue' in value) {
    return (value.arrayValue.values ?? []).map((entry) => fromFirestoreValue(entry));
  }

  if ('mapValue' in value) {
    const mapped = value.mapValue.fields ?? {};
    return Object.entries(mapped).reduce<Record<string, unknown>>((acc, [key, field]) => {
      acc[key] = fromFirestoreValue(field);
      return acc;
    }, {});
  }

  return null;
};

export const fromFirestoreDocument = <T>(document: FirestoreDocumentResponse): T | null => {
  if (!document.fields) {
    return null;
  }

  return Object.entries(document.fields).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = fromFirestoreValue(value);
    return acc;
  }, {}) as T;
};
