import { Vector2 } from "@codedazur/essentials";
import {
  Box,
  Center,
  Column,
  Image,
  Row,
  Stack,
  Surface,
  Text,
} from "@codedazur/fusion-ui";
import { useParallax } from "@codedazur/react-parallax";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/nextjs";
import layerFive from "./diorama/layer-five.png";
import layerFour from "./diorama/layer-four.png";
import layerOne from "./diorama/layer-one.png";
import layerSix from "./diorama/layer-six.png";
import layerThree from "./diorama/layer-three.png";
import layerTwo from "./diorama/layer-two.png";
import { Placeholder } from "../../components/Placeholder";

const meta: Meta = {
  title: "React/Parallax/useParallax",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <>
      <Center style={{ height: "100vh" }}>
        <Row gap={400}>
          {[-0.5, 0, 0.5, 1, 1.5].map((factor, index) => (
            <Placeholder
              key={index}
              ref={useParallax<HTMLDivElement>({ factor })}
              size={600}
            >
              <Text>{factor}</Text>
            </Placeholder>
          ))}
        </Row>
      </Center>
      <Box style={{ width: "200vw", height: "200vh" }} />
    </>
  ),
};

export const Heroes: StoryObj = {
  render: () => (
    <Column padding={1200} gap={1200}>
      <Hero />
      <Hero />
      <Hero />
      <Hero />
      <Hero />
    </Column>
  ),
};

const Hero = () => {
  const ref = useParallax<HTMLImageElement>({
    factor: 0.5,
    cover: true,
  });

  return (
    <Surface overflow="hidden">
      <Stack>
        <Image
          ref={ref}
          src={faker.image.urlPicsumPhotos({ width: 1920, height: 1080 })}
          aspectRatio="16:9"
          alt=""
        />
        <Box background={{ color: "gray.0" }} opacity={500}>
          <Center size="stretch">
            <Text variant="title">{faker.commerce.productName()}</Text>
          </Center>
        </Box>
      </Stack>
    </Surface>
  );
};

export const Diorama: StoryObj = {
  render: function Diorama() {
    return (
      <>
        <Center style={{ height: "100vh" }}>
          <Stack overflow="hidden">
            <Image
              src={layerOne.src}
              ref={useParallax({ factor: 0.6 })}
              alt=""
            />
            <Image
              src={layerTwo.src}
              ref={useParallax({ factor: 0.7 })}
              alt=""
            />
            <Image
              src={layerThree.src}
              ref={useParallax({ factor: 0.8 })}
              alt=""
            />
            <Image
              src={layerFour.src}
              ref={useParallax({ factor: 0.9 })}
              alt=""
            />
            <Image
              src={layerFive.src}
              ref={useParallax({ factor: 1 })}
              alt=""
            />
            <Image src={layerSix.src} ref={useParallax({ factor: 1 })} alt="" />
          </Stack>
        </Center>
        <Box style={{ height: "200vh" }} />
      </>
    );
  },
};

export const NonLinear: StoryObj = {
  render: function NonLinear() {
    const ref = useParallax<HTMLDivElement>({
      factor: ({ x, y }) =>
        new Vector2(5 * Math.sqrt(x), 0.005 * Math.pow(y, 2)),
    });

    return (
      <>
        <Placeholder variant="lowest" style={{ height: "100vh" }}>
          <Placeholder ref={ref} size={600}>
            <Text style={{ fontFamily: "system-ui" }}>5⋅√x</Text>
            <Text style={{ fontFamily: "system-ui" }}>0.005⋅y²</Text>
          </Placeholder>
        </Placeholder>
        <Box style={{ width: "200vw", height: "100vh" }} />
      </>
    );
  },
};

export const Dynamic: StoryObj = {
  render: function Dynamic() {
    const ref = useParallax<HTMLDivElement>({
      factor: ({ y }) => new Vector2(0, y < 200 ? y : y > 400 ? y - 200 : 200),
    });

    return (
      <>
        <Placeholder variant="lowest" style={{ height: "100vh" }}>
          <Placeholder ref={ref} size={600} />
        </Placeholder>
        <Box style={{ width: "200vw", height: "100vh" }} />
      </>
    );
  },
};
