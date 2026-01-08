import { Bar } from "@apps/storybook/components/Bar";
import { Icon } from "@apps/storybook/components/Icon";
import { List } from "@apps/storybook/components/List";
import { WithCenter } from "@apps/storybook/decorators/WithCenter";
import { Origin, pick, timecode } from "@codedazur/essentials";
import {
  Center,
  Column,
  Flex,
  IconButton,
  Image,
  Popover,
  Row,
  Slider,
  Stack,
  Surface,
  Text,
} from "@codedazur/fusion-ui";
import {
  MediaProvider,
  useMedia,
  useMediaProgress,
  useMediaVolume,
} from "@codedazur/react-media";
import { Meta, StoryObj } from "@storybook/nextjs";
import { FunctionComponent, useMemo, useRef } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
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
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.Pause}
      onClick={pause}
    />
  ) : (
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.Play}
      onClick={play}
      disabled={!track}
    />
  );
};

const StopButton = () => {
  const { isPlaying, stop } = useMedia();

  return (
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.Stop}
      onClick={stop}
      disabled={!isPlaying}
    />
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
    <Row gap={400}>
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
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.VolumeOff}
      onClick={unmute}
    />
  ) : (
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.VolumeUp}
      onClick={mute}
    />
  );
};

const VolumeSlider = () => {
  const { volume, setVolume } = useMediaVolume();

  return <Slider size={{ width: 400 }} value={volume} onChange={setVolume} />;
};

export const WithSeekControls = () => (
  <MediaProvider tracks={[meteorites]}>
    <Column gap={400} align="center">
      <Row gap={400}>
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

  return (
    <Text noWrap variant="label" size="small" font={5}>
      {timecode.minutes(Math.round(time))}
    </Text>
  );
};

const ProgressSlider = () => {
  const { progress, setProgress } = useMediaProgress();

  return (
    <Slider
      size={{ width: 600 }}
      value={progress}
      onDragEnd={(progress) => setProgress(progress)}
    />
  );
};

const Duration = () => {
  const { duration } = useMedia();

  return (
    <Text noWrap variant="label" size="small" font={5}>
      {timecode.minutes(duration)}
    </Text>
  );
};

export const WithDynamicTrack = () => (
  <MediaProvider>
    <Column gap={1100} align="center">
      <SelectTrack tracks={[meteorites, alienated, tabulaRasa]} />
      <Column gap={400} align="center">
        <Row gap={400}>
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
  <Column gap={400}>
    {tracks.map((track) => (
      <Row key={track} gap={200} align="center">
        <TrackRadioButton track={track} />
        <Text noWrap font={5}>
          {track.split("/").at(-1)}
        </Text>
      </Row>
    ))}
  </Column>
);

const TrackRadioButton = ({ track }: { track: string }) => {
  const { track: currentTrack, setTrack } = useMedia();

  return track === currentTrack ? (
    <IconButton variant="tertiary" icon={Icon.RadioButtonChecked} disabled />
  ) : (
    <IconButton
      variant="tertiary"
      icon={Icon.RadioButtonUnchecked}
      onClick={() => setTrack(track)}
    />
  );
};

export const WithPlaylist = () => (
  <MediaProvider tracks={[meteorites, alienated, tabulaRasa]}>
    <Column gap={1100} align="center">
      <TrackList />
      <Column gap={400} align="center">
        <Row gap={400}>
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
        <Row
          key={index}
          gap={200}
          padding={{ all: 200, right: 600 }}
          align="center"
        >
          {cursor === index && isPlaying ? (
            <IconButton variant="tertiary" icon={Icon.Pause} onClick={pause} />
          ) : (
            <IconButton
              variant="tertiary"
              icon={Icon.Play}
              onClick={() => {
                setCursor(index);
                play();
              }}
            />
          )}
          <Text noWrap font={5}>
            {track.split("/").at(-1)}
          </Text>
        </Row>
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
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.Repeat}
      onClick={toggleRepeat}
      opacity={repeat ? undefined : 500}
    />
  );
};

const ShuffleButton = () => {
  const { shuffle, toggleShuffle } = useMedia();

  return (
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.Shuffle}
      onClick={toggleShuffle}
      opacity={shuffle ? undefined : 500}
    />
  );
};

const PreviousButton = () => {
  const { previous, canPlayPrevious } = useMedia();

  return (
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.SkipPrevious}
      onClick={previous}
      disabled={!canPlayPrevious}
    />
  );
};

const NextButton = () => {
  const { next, canPlayNext } = useMedia();

  return (
    <IconButton
      variant="tertiary"
      size="small"
      icon={Icon.SkipNext}
      onClick={next}
      disabled={!canPlayNext}
    />
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
    artwork: seaOfStars.src,
  },
  {
    source: alienated,
    name: "Alienated",
    artist: "Purrple Cat",
    album: "Distant Worlds II",
    artwork: distantWorldsIi.src,
  },
  {
    source: tabulaRasa,
    name: "Tabula Rasa",
    artist: "Purrple Cat",
    album: "Distant Worlds",
    artwork: distantWorlds.src,
  },
];

export const WithMetadata = () => (
  <MediaProvider tracks={myTracks}>
    <FullscreenArtwork />
    <Column gap={1100} align="center">
      <FancyTrackList />
      <Column gap={400} align="center">
        <Row gap={400}>
          <PlaylistControls />
          <StateControls />
          <VolumeControls />
        </Row>
        <Row gap={400}>
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
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: `url(${track.artwork})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
        <Row key={index} gap={400} padding={{ all: 300, right: 400 }}>
          <Surface size={300}>
            <Stack>
              <Surface overflow="hidden">
                <Image src={track.artwork} alt={track.album} />
              </Surface>
              <Center>
                {cursor === index && isPlaying ? (
                  <IconButton
                    variant="tertiary"
                    icon={Icon.Pause}
                    onClick={pause}
                  />
                ) : (
                  <IconButton
                    variant="tertiary"
                    icon={Icon.Play}
                    onClick={() => {
                      setCursor(index);
                      play();
                    }}
                  />
                )}
              </Center>
            </Stack>
          </Surface>
          <Flex grow={1}>
            <Column constraints={{ maxWidth: 850 }} justify="center">
              <Text noWrap font={5}>
                {track.name}
              </Text>
              <Text noWrap font={5} opacity={500}>
                {track.artist} • {track.album}
              </Text>
            </Column>
          </Flex>
        </Row>
      ))}
    </List>
  );
};

const TrackData = () => {
  const { track } = useMedia<MyTrack>();

  return (
    <Bar>
      <Surface size={150} overflow="hidden">
        {track ? <Image src={track.artwork} alt={track.album} /> : null}
      </Surface>
      <Text noWrap variant="label" size="small" font={5}>
        {track?.name ?? <Text opacity={500}>...</Text>}
      </Text>
    </Bar>
  );
};

export const WithVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <MediaProvider tracks={[bigBuckBunny]} element={videoRef}>
      <Column gap={1100} align="center">
        <Surface overflow="hidden">
          <video ref={videoRef} width="540" style={{ display: "block" }} />
        </Surface>
        <Column gap={400} align="center">
          <Row gap={400}>
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
      <Column gap={1100} align="center">
        <Surface overflow="hidden">
          <video
            ref={videoRef}
            width="540"
            muted
            style={{ display: "block" }}
          />
        </Surface>
        <Column gap={400} align="center">
          <Row gap={400}>
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
    <Popover
      open={true}
      anchor={{
        strategy: "fixed",
        parent: Origin.bottomLeft,
        child: Origin.bottomLeft,
        offset: { x: "1rem", y: "-1rem" },
      }}
      pointerEvents="none"
    >
      <Surface
        padding={400}
        text={{ font: 5, size: 100 }}
        flex={{ direction: "column" }}
        opacity={500}
      >
        {attributions[source]?.map((line) => (
          <Text key={line} font={5} size="small">
            {line}
          </Text>
        ))}
      </Surface>
    </Popover>
  );
};

interface MediaDebugOverlayProps extends Partial<
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
