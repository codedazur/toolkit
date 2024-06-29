"use client";

import { useContext } from "react";
import { TrackingContext, trackingContext } from "../contexts/trackingContext";
import { omit } from "@codedazur/essentials";

export const useTracker = (): Omit<TrackingContext, "tracker"> => {
  const context = useContext(trackingContext);

  return omit(context, ["tracker"]);
};
