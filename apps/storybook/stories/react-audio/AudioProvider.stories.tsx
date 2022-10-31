import {
  AbsorbPointer,
  Avatar,
  Background,
  Center,
  Column,
  Divider,
  Flex,
  IconButton,
  Image,
  Opacity,
  Padding,
  PauseIcon,
  pick,
  Placeholder,
  PlayArrowIcon,
  Positioned,
  RadioCheckedIcon,
  RadioUncheckedIcon,
  RepeatIcon,
  Row,
  Separate,
  ShuffleIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  Slider,
  StopIcon,
  Text,
  timecode,
  VolumeUpIcon,
} from "@codedazur/react-components";
import {
  AudioProvider,
  useAudio,
  useAudioProgress,
  useAudioVolume,
} from "@codedazur/react-audio";
import { meta } from "../../utilities/meta";
import { story } from "../../utilities/story";
import docs from "./AudioProvider.docs.mdx";
import { Children, FunctionComponent, ReactNode, useMemo } from "react";
import distantWorldsIi from "./artworks/distant-worlds-ii.jpg";
import distantWorlds from "./artworks/distant-worlds.jpg";
import seaOfStars from "./artworks/sea-of-stars.jpg";
import alienated from "./tracks/alienated.mp3";
import meteorites from "./tracks/meteorites.mp3";
import tabulaRasa from "./tracks/tabula-rasa.mp3";
import { WithCenter } from "../../decorators/WithCenter";

export default meta({
  decorators: [WithCenter],
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => (
  <AudioProvider tracks={[meteorites]}>
    <StateControls />
    <TrackAttributionOverlay />
    <AudioDebugOverlay isPlaying />
  </AudioProvider>
));

const StateControls = () => (
  <SegmentedBar>
    <Row gap="1rem" crossAxisAlignment="center">
      <PlayButton />
      <StopButton />
    </Row>
  </SegmentedBar>
);

const PlayButton = () => {
  const { track, isPlaying, pause, play } = useAudio();

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
  const { isPlaying, stop } = useAudio();

  return (
    <IconButton onClick={stop} disabled={!isPlaying}>
      <StopIcon />
    </IconButton>
  );
};

export const WithVolumeControls = story(() => (
  <AudioProvider tracks={[meteorites]}>
    <Row gap="1rem">
      <StateControls />
      <VolumeControls />
    </Row>
    <TrackAttributionOverlay />
    <AudioDebugOverlay isPlaying volume />
  </AudioProvider>
));

const VolumeControls = () => (
  <SegmentedBar>
    <Row gap="1rem" crossAxisAlignment="center">
      <VolumeUpIcon />
      <VolumeSlider />
    </Row>
  </SegmentedBar>
);

const VolumeSlider = () => {
  const { volume, setVolume } = useAudioVolume();

  return (
    <Padding right="0.5rem">
      <Slider width="4rem" value={volume} onChange={setVolume} />
    </Padding>
  );
};

export const WithSeekControls = story(() => (
  <AudioProvider tracks={[meteorites]}>
    <Column gap="1rem" crossAxisAlignment="center">
      <Row gap="1rem">
        <StateControls />
        <VolumeControls />
      </Row>
      <SeekControls />
    </Column>
    <TrackAttributionOverlay />
    <AudioDebugOverlay isPlaying volume time duration />
  </AudioProvider>
));

const SeekControls = () => (
  <SegmentedBar>
    <Row gap="1rem" crossAxisAlignment="center">
      <Time />
      <ProgressSlider />
      <Duration />
    </Row>
  </SegmentedBar>
);

const Time = () => {
  const { time } = useAudioProgress({ targetFps: 1 });

  return <Text>{timecode.minutes(Math.round(time))}</Text>;
};

const ProgressSlider = () => {
  const { progress, setProgress } = useAudioProgress();

  return (
    <Slider
      width="10rem"
      value={progress}
      onDragEnd={(progress) => setProgress(progress)}
    />
  );
};

const Duration = () => {
  const { duration } = useAudio();

  return <Text>{timecode.minutes(duration)}</Text>;
};

export const WithDynamicTrack = story(() => (
  <AudioProvider>
    <Column gap="5rem" crossAxisAlignment="center">
      <SelectTrack tracks={[meteorites, alienated, tabulaRasa]} />
      <Column gap="1rem" crossAxisAlignment="center">
        <Row gap="1rem">
          <StateControls />
          <VolumeControls />
        </Row>
        <SeekControls />
      </Column>
    </Column>
    <TrackAttributionOverlay />
    <AudioDebugOverlay track isPlaying volume time duration />
  </AudioProvider>
));

const SelectTrack = ({ tracks }: { tracks: string[] }) => (
  <Column gap="1rem">
    {tracks.map((track) => (
      <Row key={track} gap="1rem" align="center">
        <TrackRadioButton track={track} />
        <Text>{track.split("/").at(-1)}</Text>
      </Row>
    ))}
  </Column>
);

const TrackRadioButton = ({ track }: { track: string }) => {
  const { track: currentTrack, setTrack } = useAudio();

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

export const WithPlaylist = story(() => (
  <AudioProvider tracks={[meteorites, alienated, tabulaRasa]}>
    <Column gap="5rem" crossAxisAlignment="center">
      <TrackList />
      <Column gap="1rem" crossAxisAlignment="center">
        <Row gap="1rem">
          <PlaylistControls />
          <StateControls />
          <VolumeControls />
        </Row>
        <SeekControls />
      </Column>
    </Column>
    <TrackAttributionOverlay />
    <AudioDebugOverlay tracks cursor isPlaying volume time duration />
  </AudioProvider>
));

const TrackList = () => {
  const { cursor, setCursor, tracks, isPlaying, pause, play } =
    useAudio<string>();

  return (
    <SegmentedList>
      {tracks.map((track, index) => (
        <Row key={index} gap="1rem" crossAxisAlignment="center">
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
      ))}
    </SegmentedList>
  );
};

const PlaylistControls = () => (
  <SegmentedBar>
    <Row gap="1rem">
      <RepeatButton />
      <ShuffleButton />
      <PreviousButton />
      <NextButton />
    </Row>
  </SegmentedBar>
);

const RepeatButton = () => {
  const { repeat, toggleRepeat } = useAudio();

  return (
    <IconButton onClick={toggleRepeat}>
      <Opacity opacity={repeat ? 1 : 0.5}>
        <RepeatIcon />
      </Opacity>
    </IconButton>
  );
};

const ShuffleButton = () => {
  const { shuffle, toggleShuffle } = useAudio();

  return (
    <IconButton onClick={toggleShuffle}>
      <Opacity opacity={shuffle ? 1 : 0.5}>
        <ShuffleIcon />
      </Opacity>
    </IconButton>
  );
};

const PreviousButton = () => {
  const { previous, canPlayPrevious } = useAudio();

  return (
    <IconButton onClick={previous} disabled={!canPlayPrevious}>
      <SkipPreviousIcon />
    </IconButton>
  );
};

const NextButton = () => {
  const { next, canPlayNext } = useAudio();

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

export const WithMetadata = story(() => (
  <AudioProvider tracks={myTracks}>
    <FullscreenArtwork />
    <Column gap="5rem" crossAxisAlignment="center">
      <FancyTrackList />
      <Column gap="1rem" crossAxisAlignment="center">
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
    <AudioDebugOverlay tracks cursor isPlaying volume time duration />
  </AudioProvider>
));

const FullscreenArtwork = () => {
  const { track } = useAudio<MyTrack>();

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
    useAudio<MyTrack>();

  return (
    <SegmentedList>
      {tracks.map((track, index) => (
        <Row key={index} gap="1rem" crossAxisAlignment="center">
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
          <Avatar shape="rounded" width="3rem" height="3rem">
            <Image source={track.artwork} />
          </Avatar>
          <Flex grow={1}>
            <Column maxWidth="25rem" mainAxisAlignment="center">
              <Text noWrap>{track.name}</Text>
              <Opacity opacity={0.5}>
                <Text noWrap>
                  {track.artist} • {track.album}
                </Text>
              </Opacity>
            </Column>
          </Flex>
        </Row>
      ))}
    </SegmentedList>
  );
};

const TrackData = () => {
  const { track } = useAudio<MyTrack>();

  return (
    <SegmentedBar>
      <Row gap="1rem">
        <Avatar shape="rounded" width="1.5rem" height="1.5rem">
          {track ? <Image source={track.artwork} /> : null}
        </Avatar>
        <Text noWrap>
          {track?.name ?? <Opacity opacity={0.5}>...</Opacity>}
        </Text>
      </Row>
    </SegmentedBar>
  );
};

const SegmentedList = ({ children }: { children?: ReactNode }) => (
  <Placeholder width="auto" height="auto" shape="rounded" bordered>
    <Padding vertical="1rem">
      <Column gap="1rem">
        <Separate separator={<Divider />}>
          {Children.toArray(children).map((child, index) => (
            <Padding key={index} horizontal="1rem">
              {child}
            </Padding>
          ))}
        </Separate>
      </Column>
    </Padding>
  </Placeholder>
);

const SegmentedBar = ({ children }: { children?: ReactNode }) => (
  <Placeholder width="auto" height="auto" shape="stadium" bordered>
    <Padding horizontal="0.25rem">
      <Row crossAxisAlignment="center">
        <Separate separator={<Divider vertical />}>
          {Children.toArray(children).map((child, index) => (
            <Padding key={index} horizontal="1rem" vertical="0.5rem">
              {child}
            </Padding>
          ))}
        </Separate>
      </Row>
    </Padding>
  </Placeholder>
);

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
};

const TrackAttributionOverlay = () => {
  const { track } = useAudio();

  if (!track) {
    return null;
  }

  const source = typeof track === "string" ? track : track.source;

  return (
    <Positioned bottom="1rem" left="1rem">
      <AbsorbPointer>
        <Opacity opacity={0.5}>
          <Column style={{ fontSize: "smaller", lineHeight: "1.5em" }}>
            {attributions[source].map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </Column>
        </Opacity>
      </AbsorbPointer>
    </Positioned>
  );
};

interface AudioDebugOverlayProps
  extends Partial<
    Record<
      | keyof ReturnType<typeof useAudio>
      | keyof ReturnType<typeof useAudioVolume>
      | keyof ReturnType<typeof useAudioProgress>,
      boolean
    >
  > {
  targetFps?: number;
}

const AudioDebugOverlay: FunctionComponent<AudioDebugOverlayProps> = ({
  targetFps,
  ...keyObject
}) => {
  return null;

  // const audio = {
  //   ...useAudio(),
  //   ...useAudioVolume(),
  //   ...useAudioProgress({ targetFps }),
  // };

  // const keys = useMemo(
  //   () =>
  //     Object.entries(keyObject)
  //       .filter(([, value]) => !!value)
  //       .map(([key]) => key) as Array<
  //       keyof ReturnType<typeof useAudioProgress>
  //     >,
  //   [keyObject]
  // );

  // return <DebugOverlay value={pick(audio, keys)} />;
};
