import { nanoid } from "nanoid";

export const createId = (prefix: string): string => `${prefix}-${nanoid(10)}`;
