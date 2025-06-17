import { Vector2 } from "@codedazur/essentials";
import {
  AspectRatio,
  Background,
  Box,
  Center,
  Image,
  Placeholder,
  Row,
  SizedBox,
  Stack,
  Text,
  black,
} from "@codedazur/react-components";
import { useParallax } from "@codedazur/react-parallax";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react";
import styled from "styled-components";
import layerFive from "./diorama/layer-five.png";
import layerFour from "./diorama/layer-four.png";
import layerOne from "./diorama/layer-one.png";
import layerSix from "./diorama/layer-six.png";
import layerThree from "./diorama/layer-three.png";
import layerTwo from "./diorama/layer-two.png";

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
      <Placeholder height="100vh">
        <Row gap="1rem">
          {[-0.5, 0, 0.5, 1, 1.5].map((factor, index) => (
            <Placeholder
              key={index}
              ref={useParallax<HTMLDivElement>({ factor })}
              width="10rem"
              height="10rem"
            >
              <Text>{factor}</Text>
            </Placeholder>
          ))}
        </Row>
      </Placeholder>
      <SizedBox width="200vw" height="200vh" />
    </>
  ),
};

export const Heroes: StoryObj = {
  render: () => (
    <Box padding="10vw" flex={{ direction: "column", gap: "10vw" }}>
      <Hero />
      <Hero />
      <Hero />
      <Hero />
      <Hero />
    </Box>
  ),
};

const Hero = () => {
  const ref = useParallax<HTMLImageElement>({
    factor: 0.5,
    cover: true,
  });

  return (
    <Box shape="rounded">
      <Stack>
        <AspectRatio ratio={16 / 9}>
          <Image
            ref={ref}
            src={faker.image.urlPicsumPhotos({ width: 1920, height: 1080 })}
            alt=""
          />
        </AspectRatio>
        <Background $color={black.alpha(0.5)} style={{ zIndex: 1 }}>
          <Center>
            <Title>{faker.commerce.productName()}</Title>
          </Center>
        </Background>
      </Stack>
    </Box>
  );
};

const Title = styled(Text)`
  font-size: 2.5vw;
`;

export const Diorama: StoryObj = {
  render: function Diorama() {
    return (
      <>
        <Center>
          <Stack>
            <Image src={layerOne} ref={useParallax({ factor: 0.6 })} alt="" />
            <Image src={layerTwo} ref={useParallax({ factor: 0.7 })} alt="" />
            <Image src={layerThree} ref={useParallax({ factor: 0.8 })} alt="" />
            <Image src={layerFour} ref={useParallax({ factor: 0.9 })} alt="" />
            <Image src={layerFive} ref={useParallax({ factor: 1 })} alt="" />
            <Image src={layerSix} ref={useParallax({ factor: 1 })} alt="" />
          </Stack>
        </Center>
        <SizedBox height="200vh" />
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
        <Placeholder height="100vh">
          <Placeholder ref={ref} width="10rem" height="10rem">
            <Text style={{ fontFamily: "system-ui" }}>5⋅√x</Text>
            <Text style={{ fontFamily: "system-ui" }}>0.005⋅y²</Text>
          </Placeholder>
        </Placeholder>
        <SizedBox width="200vw" height="100vh" />
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
        <Placeholder height="100vh">
          <Placeholder ref={ref} width="10rem" height="10rem" />
        </Placeholder>
        <SizedBox width="200vw" height="100vh" />
      </>
    );
  },
};
