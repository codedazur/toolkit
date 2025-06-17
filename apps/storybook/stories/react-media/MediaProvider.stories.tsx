import { Bar } from "@apps/storybook/components/Bar";
import { List } from "@apps/storybook/components/List";
import { WithCenter } from "@apps/storybook/decorators/WithCenter";
import {
  AbsorbPointer,
  Avatar,
  Background,
  Center,
  Column,
  EdgeInset,
  Flex,
  IconButton,
  Image,
  Opacity,
  Padding,
  PauseIcon,
  PlayArrowIcon,
  Positioned,
  RadioCheckedIcon,
  RadioUncheckedIcon,
  RepeatIcon,
  Row,
  ShuffleIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  Slider,
  Stack,
  StopIcon,
  Text,
  VolumeOffIcon,
  VolumeUpIcon,
  pick,
  timecode,
} from "@codedazur/react-components";
import {
  MediaProvider,
  useMedia,
  useMediaProgress,
  useMediaVolume,
} from "@codedazur/react-media";
import { Meta, StoryObj } from "@storybook/react";
import { FunctionComponent, useMemo, useRef } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Monospace } from "../../components/Monospace";
import distantWorldsIi from "./artworks/distant-worlds-ii.jpg";
import distantWorlds from "./artworks/distant-worlds.jpg";
import seaOfStars from "./artworks/sea-of-stars.jpg";
import alienated from "./tracks/alienated.mp3";
import meteorites from "./tracks/meteorites.mp3";
import tabulaRasa from "./tracks/tabula-rasa.mp3";
import bigBuckBunny from "./videos/big-buck-bunny.mp4";

const meta: Meta = {
  title: "React/Media/MediaProvider",
  decorators: [WithCenter],
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <MediaProvider tracks={[meteorites]}>
      <StateControls />
      <TrackAttributionOverlay />
      <MediaDebugOverlay isPlaying />
    </MediaProvider>
  ),
};

const StateControls = () => (
  <Bar>
    <PlayButton />
    <StopButton />
  </Bar>
);

const PlayButton = () => {
  const { track, isPlaying, pause, play } = useMedia();

  return isPlaying ? (
    <IconButton onClick={pause}>
      <PauseIcon />
    </IconButton>
  ) : (
    <IconButton onClick={play} disabled={!track}>
      <PlayArrowIcon />
    </IconButton>
  );
};

const StopButton = () => {
  const { isPlaying, stop } = useMedia();

  return (
    <IconButton onClick={stop} disabled={!isPlaying}>
      <StopIcon />
    </IconButton>
  );
};

export const WithAutoPlay: StoryObj = {
  render: () => (
    <MediaProvider tracks={[meteorites]} autoPlay>
      <StateControls />
      <TrackAttributionOverlay />
      <MediaDebugOverlay isPlaying />
    </MediaProvider>
  ),
};

export const WithVolumeControls = () => (
  <MediaProvider tracks={[meteorites]}>
    <Row gap="1rem">
      <StateControls />
      <VolumeControls />
    </Row>
    <TrackAttributionOverlay />
    <MediaDebugOverlay isPlaying isMuted volume />
  </MediaProvider>
);

const VolumeControls = () => (
  <Bar>
    <MuteButton />
    <VolumeSlider />
  </Bar>
);

const MuteButton = () => {
  const { isMuted, mute, unmute } = useMedia();

  return isMuted ? (
    <IconButton onClick={unmute}>
      <VolumeOffIcon />
    </IconButton>
  ) : (
    <IconButton onClick={mute}>
      <VolumeUpIcon />
    </IconButton>
  );
};

const VolumeSlider = () => {
  const { volume, setVolume } = useMediaVolume();

  return (
    <Padding right="0.5rem">
      <Slider width="4rem" value={volume} onChange={setVolume} />
    </Padding>
  );
};

export const WithSeekControls = () => (
  <MediaProvider tracks={[meteorites]}>
    <Column gap="1rem" align="center">
      <Row gap="1rem">
        <StateControls />
        <VolumeControls />
      </Row>
      <SeekControls />
    </Column>
    <TrackAttributionOverlay />
    <MediaDebugOverlay isPlaying isMuted volume time duration />
  </MediaProvider>
);

const SeekControls = () => (
  <Bar>
    <Time />
    <ProgressSlider />
    <Duration />
  </Bar>
);

const Time = () => {
  const { time } = useMediaProgress({ targetFps: 1 });

  return <Text>{timecode.minutes(Math.round(time))}</Text>;
};

const ProgressSlider = () => {
  const { progress, setProgress } = useMediaProgress();

  return (
    <Slider
      width="10rem"
      value={progress}
      onDragEnd={(progress) => setProgress(progress)}
    />
  );
};

const Duration = () => {
  const { duration } = useMedia();

  return <Text>{timecode.minutes(duration)}</Text>;
};

export const WithDynamicTrack = () => (
  <MediaProvider>
    <Column gap="5rem" align="center">
      <SelectTrack tracks={[meteorites, alienated, tabulaRasa]} />
      <Column gap="1rem" align="center">
        <Row gap="1rem">
          <StateControls />
          <VolumeControls />
        </Row>
        <SeekControls />
      </Column>
    </Column>
    <TrackAttributionOverlay />
    <MediaDebugOverlay track isPlaying volume time duration />
  </MediaProvider>
);

const SelectTrack = ({ tracks }: { tracks: string[] }) => (
  <Column gap="1rem">
    {tracks.map((track) => (
      <Row key={track} gap="0.5rem" align="center">
        <TrackRadioButton track={track} />
        <Text>{track.split("/").at(-1)}</Text>
      </Row>
    ))}
  </Column>
);

const TrackRadioButton = ({ track }: { track: string }) => {
  const { track: currentTrack, setTrack } = useMedia();

  return track === currentTrack ? (
    <IconButton disabled>
      <RadioCheckedIcon />
    </IconButton>
  ) : (
    <IconButton onClick={() => setTrack(track)}>
      <RadioUncheckedIcon />
    </IconButton>
  );
};

export const WithPlaylist = () => (
  <MediaProvider tracks={[meteorites, alienated, tabulaRasa]}>
    <Column gap="5rem" align="center">
      <TrackList />
      <Column gap="1rem" align="center">
        <Row gap="1rem">
          <PlaylistControls />
          <StateControls />
          <VolumeControls />
        </Row>
        <SeekControls />
      </Column>
    </Column>
    <TrackAttributionOverlay />
    <MediaDebugOverlay tracks cursor isPlaying isMuted volume time duration />
  </MediaProvider>
);

const TrackList = () => {
  const { cursor, setCursor, tracks, isPlaying, pause, play } =
    useMedia<string>();

  return (
    <List>
      {tracks.map((track, index) => (
        <EdgeInset key={index} all="0.5rem">
          <Row gap="0.5rem">
            {cursor === index && isPlaying ? (
              <IconButton onClick={pause}>
                <PauseIcon />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => {
                  setCursor(index);
                  play();
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            )}
            <Text noWrap>{track.split("/").at(-1)}</Text>
          </Row>
        </EdgeInset>
      ))}
    </List>
  );
};

const PlaylistControls = () => (
  <Bar>
    <RepeatButton />
    <ShuffleButton />
    <PreviousButton />
    <NextButton />
  </Bar>
);

const RepeatButton = () => {
  const { repeat, toggleRepeat } = useMedia();

  return (
    <IconButton onClick={toggleRepeat}>
      <Opacity opacity={repeat ? 1 : 0.5}>
        <RepeatIcon />
      </Opacity>
    </IconButton>
  );
};

const ShuffleButton = () => {
  const { shuffle, toggleShuffle } = useMedia();

  return (
    <IconButton onClick={toggleShuffle}>
      <Opacity opacity={shuffle ? 1 : 0.5}>
        <ShuffleIcon />
      </Opacity>
    </IconButton>
  );
};

const PreviousButton = () => {
  const { previous, canPlayPrevious } = useMedia();

  return (
    <IconButton onClick={previous} disabled={!canPlayPrevious}>
      <SkipPreviousIcon />
    </IconButton>
  );
};

const NextButton = () => {
  const { next, canPlayNext } = useMedia();

  return (
    <IconButton onClick={next} disabled={!canPlayNext}>
      <SkipNextIcon />
    </IconButton>
  );
};

type MyTrack = {
  source: string;
  name: string;
  artist: string;
  album: string;
  artwork: string;
};

const myTracks: MyTrack[] = [
  {
    source: meteorites,
    name: "Meteorites",
    artist: "Purrple Cat",
    album: "Sea of Stars",
    artwork: seaOfStars,
  },
  {
    source: alienated,
    name: "Alienated",
    artist: "Purrple Cat",
    album: "Distant Worlds II",
    artwork: distantWorldsIi,
  },
  {
    source: tabulaRasa,
    name: "Tabula Rasa",
    artist: "Purrple Cat",
    album: "Distant Worlds",
    artwork: distantWorlds,
  },
];

export const WithMetadata = () => (
  <MediaProvider tracks={myTracks}>
    <FullscreenArtwork />
    <Column gap="5rem" align="center">
      <FancyTrackList />
      <Column gap="1rem" align="center">
        <Row gap="1rem">
          <PlaylistControls />
          <StateControls />
          <VolumeControls />
        </Row>
        <Row gap="1rem">
          <TrackData />
          <SeekControls />
        </Row>
      </Column>
    </Column>
    <TrackAttributionOverlay />
    <MediaDebugOverlay tracks cursor isPlaying isMuted volume time duration />
  </MediaProvider>
);

const FullscreenArtwork = () => {
  const { track } = useMedia<MyTrack>();

  if (!track) return null;

  return (
    <Background
      width="100%"
      height="100%"
      image={`url(${track.artwork})`}
      size="cover"
      position="center"
      style={{
        position: "absolute",
        zIndex: -1,
        opacity: 0.25,
        filter: "blur(4rem)",
        transition: "1.5s",
      }}
    />
  );
};

const FancyTrackList = () => {
  const { cursor, setCursor, tracks, isPlaying, pause, play } =
    useMedia<MyTrack>();

  return (
    <List>
      {tracks.map((track, index) => (
        <EdgeInset key={index} all="0.75rem" right="1rem">
          <Row gap="1rem">
            <Avatar shape="rounded" width="3rem" height="3rem">
              <Stack>
                <Image src={track.artwork} alt={track.album} />
                <Center>
                  {cursor === index && isPlaying ? (
                    <IconButton onClick={pause}>
                      <PauseIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => {
                        setCursor(index);
                        play();
                      }}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  )}
                </Center>
              </Stack>
            </Avatar>
            <Flex grow={1}>
              <Column maxWidth="25rem" justify="center">
                <Text noWrap>{track.name}</Text>
                <Opacity opacity={0.5}>
                  <Text noWrap>
                    {track.artist} • {track.album}
                  </Text>
                </Opacity>
              </Column>
            </Flex>
          </Row>
        </EdgeInset>
      ))}
    </List>
  );
};

const TrackData = () => {
  const { track } = useMedia<MyTrack>();

  return (
    <Bar>
      <Avatar shape="rounded" width="1.5rem" height="1.5rem">
        {track ? <Image src={track.artwork} alt={track.album} /> : null}
      </Avatar>
      <Text noWrap>{track?.name ?? <Opacity opacity={0.5}>...</Opacity>}</Text>
    </Bar>
  );
};

export const WithVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <MediaProvider tracks={[bigBuckBunny]} element={videoRef}>
      <Column gap="5rem" align="center">
        <video ref={videoRef} width="540" />
        <Column gap="1rem" align="center">
          <Row gap="1rem">
            <StateControls />
            <VolumeControls />
          </Row>
          <SeekControls />
        </Column>
      </Column>
      <TrackAttributionOverlay />
      <MediaDebugOverlay isPlaying isMuted volume time duration />
    </MediaProvider>
  );
};

export const WithAutoPlayingVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <MediaProvider tracks={[bigBuckBunny]} element={videoRef} autoPlay>
      <Column gap="5rem" align="center">
        <video ref={videoRef} width="540" muted />
        <Column gap="1rem" align="center">
          <Row gap="1rem">
            <StateControls />
            <VolumeControls />
          </Row>
          <SeekControls />
        </Column>
      </Column>
      <TrackAttributionOverlay />
      <MediaDebugOverlay isPlaying isMuted volume time duration />
    </MediaProvider>
  );
};

const attributions = {
  [meteorites]: [
    "Meteorites by Purrple Cat",
    "https://soundcloud.com/purrplecat/meteorites",
    "Licensed under CC BY-SA 3.0",
  ],
  [alienated]: [
    "Alienated by Purrple Cat",
    "https://soundcloud.com/purrplecat/alienated",
    "Licensed under CC BY-SA 3.0",
  ],
  [tabulaRasa]: [
    "Tabula Rasa by Purrple Cat",
    "https://soundcloud.com/purrplecat/tabula-rasa",
    "Licensed under CC BY-SA 3.0",
  ],
  [bigBuckBunny]: [
    "Big Buck Bunny by Peach",
    "https://peach.blender.org/",
    "Licensed under CC BY 3.0",
  ],
};

const TrackAttributionOverlay = () => {
  const { track } = useMedia();

  if (!track) {
    return null;
  }

  const source = typeof track === "string" ? track : track.source;

  return (
    <Positioned bottom="1rem" left="1rem">
      <AbsorbPointer>
        <Opacity opacity={0.5}>
          <Column style={{ fontSize: "smaller", lineHeight: "1.5em" }}>
            {attributions[source]?.map((line) => (
              <Monospace key={line}>{line}</Monospace>
            ))}
          </Column>
        </Opacity>
      </AbsorbPointer>
    </Positioned>
  );
};

interface MediaDebugOverlayProps
  extends Partial<
    Record<
      | keyof ReturnType<typeof useMedia>
      | keyof ReturnType<typeof useMediaVolume>
      | keyof ReturnType<typeof useMediaProgress>,
      boolean
    >
  > {
  targetFps?: number;
}

const MediaDebugOverlay: FunctionComponent<MediaDebugOverlayProps> = ({
  targetFps,
  ...keyObject
}) => {
  const media = {
    ...useMedia(),
    ...useMediaVolume(),
    ...useMediaProgress({ targetFps }),
  };

  const keys = useMemo(
    () =>
      Object.entries(keyObject)
        .filter(([, value]) => !!value)
        .map(([key]) => key) as Array<
        keyof ReturnType<typeof useMediaProgress>
      >,
    [keyObject],
  );

  return <DebugOverlay value={pick(media, keys)} />;
};
