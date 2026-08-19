import { createContext } from "react";
import type { User, Toast } from "./types";

export const UpdateInfoContext = createContext((_: User) => {});
export const ToastsContext = createContext<Toast[]>([]);
export const SetToastsContext = createContext((_: Toast[]) => {});