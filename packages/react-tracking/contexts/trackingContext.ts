"use client";

import { MouseEvent, SyntheticEvent, createContext } from "react";
import { Tracker } from "../components/TrackingProvider";

export interface TrackingContext {
  path: string[];
  tracker: Tracker | Promise<Tracker> | false;
  track: (event: TrackingEvent) => Promise<void>;
  trackElement: (type: string, element: Element) => Promise<void>;
  trackEvent: (type: string, event: SyntheticEvent<Element>) => Promise<void>;
  trackNavigate: (data: Partial<PageData>) => Promise<void>;
  trackClick: (event: MouseEvent<Element>) => Promise<void>;
  trackEnter: (element: Element) => Promise<void>;
  trackExit: (element: Element) => Promise<void>;
  trackLoad: (event: SyntheticEvent<Element>) => Promise<void>;
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
  track: async () => undefined,
  trackElement: async () => undefined,
  trackEvent: async () => undefined,
  trackNavigate: async () => undefined,
  trackClick: async () => undefined,
  trackEnter: async () => undefined,
  trackExit: async () => undefined,
  trackLoad: async () => undefined,
});
