"use client";

import { useContext } from "react";
import { TrackingContext, trackingContext } from "../contexts/trackingContext";

export const useTracker = (): Omit<TrackingContext, "tracker"> => {
  const { tracker, ...rest } = useContext(trackingContext);
  return rest;
};
