export function timecode(seconds: number) {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds - hh * 3600) / 60);
  const ss = Math.floor(seconds - hh * 3600 - mm * 60);

  return [hh, mm, ss]
    .map((number) => number.toString().padStart(2, "0"))
    .join(":");
}

timecode.minutes = (seconds: number) => {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds - mm * 60);

  return [mm, ss].map((number) => number.toString().padStart(2, "0")).join(":");
};
