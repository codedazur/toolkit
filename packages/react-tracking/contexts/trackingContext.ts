import { MouseEvent, SyntheticEvent, createContext } from "react";
import { Tracker } from "../providers/TrackingProvider";

export interface TrackingContext {
  path: string[];
  tracker: Tracker | false;
  track: (event: TrackingEvent) => void;
  trackElement: (type: string, element: HTMLElement) => void;
  trackEvent: (type: string, event: SyntheticEvent<HTMLElement>) => void;
  trackNavigate: (data: Partial<PageData>) => void;
  trackClick: (event: MouseEvent<HTMLElement>) => void;
  trackEnter: (element: HTMLElement) => void;
  trackExit: (element: HTMLElement) => void;
  trackLoad: (event: SyntheticEvent<HTMLElement>) => void;
}

export enum TrackingEventType {
  navigate = "navigate",
  click = "click",
  enter = "enter",
  exit = "exit",
  load = "load",
}

export interface EventMetadata {
  timestamp: number;
  path: string;
}

export type TrackingEvent = BaseEvent | PageEvent | ElementEvent;

export interface BaseEvent {
  type: string;
  data: object;
}

export interface PageEvent extends BaseEvent {
  type: string;
  data: {
    page: PageData;
  };
}

export interface ElementEvent extends BaseEvent {
  type: string;
  data: {
    page: PageData;
    element: ElementData;
  };
}

export interface PageData {
  host: string;
  path: string;
  title: string;
}

export type ElementData =
  | BaseElementData
  | AnchorElementData
  | ImageElementData
  | MediaElementData
  | FrameElementData;

export interface BaseElementData {
  tag: string;
  id: string | null;
  path: string;
  label: string | null;
  text: string | null;
}

export interface AnchorElementData extends BaseElementData {
  anchor: {
    destination: string;
  };
}

export interface ImageElementData extends BaseElementData {
  image: {
    source: string;
    description: string;
  };
}

export interface MediaElementData extends BaseElementData {
  media: {
    source: string;
    duration: number;
    time: number;
    progress: number;
  };
}

export interface FrameElementData extends BaseElementData {
  frame: {
    source: string;
  };
}

export const trackingContext = createContext<TrackingContext>({
  path: [],
  tracker: false,
  track: () => undefined,
  trackElement: () => undefined,
  trackEvent: () => undefined,
  trackNavigate: () => undefined,
  trackClick: () => undefined,
  trackEnter: () => undefined,
  trackExit: () => undefined,
  trackLoad: () => undefined,
});
