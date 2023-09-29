import { Vector2 } from "@codedazur/essentials";
import {
  Center,
  Image,
  Placeholder,
  Row,
  SizedBox,
  Stack,
  Text,
} from "@codedazur/react-components";
import { useParallax } from "@codedazur/react-parallax";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react";
import layerFive from "./diorama/layer-five.png";
import layerFour from "./diorama/layer-four.png";
import layerOne from "./diorama/layer-one.png";
import layerSix from "./diorama/layer-six.png";
import layerThree from "./diorama/layer-three.png";
import layerTwo from "./diorama/layer-two.png";
import docs from "./useParallax.docs.mdx";

const meta: Meta = {
  title: "react-parallax/useParallax",
  parameters: {
    layout: "fullscreen",
    docs: {
      page: docs,
    },
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
              ref={useParallax({ factor })}
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

export const Hero: StoryObj = {
  render: function Default() {
    const ref = useParallax<HTMLDivElement>({
      factor: 0.5,
    });

    return (
      <>
        <Stack>
          <Placeholder ref={ref} height="40rem" crossed />
          <Center>
            <Text>{faker.commerce.productName()}</Text>
          </Center>
        </Stack>
        <SizedBox height="200vh" />
      </>
    );
  },
};

export const Diorama: StoryObj = {
  render: function Diorama() {
    const layers = [
      { src: layerOne, ref: useParallax<HTMLImageElement>({ factor: 0.7 }) },
      { src: layerTwo, ref: useParallax<HTMLImageElement>({ factor: 0.75 }) },
      { src: layerThree, ref: useParallax<HTMLImageElement>({ factor: 0.85 }) },
      { src: layerFour, ref: useParallax<HTMLImageElement>({ factor: 0.95 }) },
      { src: layerFive, ref: useParallax<HTMLImageElement>({ factor: 1 }) },
      { src: layerSix, ref: useParallax<HTMLImageElement>({ factor: 1 }) },
    ];

    return (
      <>
        <Center>
          <Stack>
            {layers.map((props, index) => (
              <Image key={index} {...props} alt="" />
            ))}
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
