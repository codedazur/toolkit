import { useContext } from "react";
import {
  audioContext,
  AudioContext,
  AudioTrack,
} from "../providers/AudioProvider";

export const useAudio = <T extends AudioTrack>(): AudioContext<T> =>
  useContext(audioContext) as unknown as AudioContext<T>;
