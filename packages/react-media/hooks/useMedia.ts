import { useContext } from "react";
import { mediaContext, MediaContext } from "../providers/MediaContext";
import { MediaTrack } from "../providers/MediaProvider";

export const useMedia = <T extends MediaTrack>(): MediaContext<T> =>
  useContext(mediaContext) as unknown as MediaContext<T>;
