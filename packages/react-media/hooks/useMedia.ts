import { useContext } from "react";
import { mediaContext, MediaContext } from "../contexts/mediaContext";
import { MediaTrack } from "../components/MediaProvider";

export const useMedia = <T extends MediaTrack>(): MediaContext<T> =>
  useContext(mediaContext) as unknown as MediaContext<T>;
