import { Vector2 } from "@codedazur/essentials";
import {
  Center,
  Image,
  Placeholder,
  Row,
  SizedBox,
  Stack,
  Text,
  Transform,
} from "@codedazur/react-components";
import { ParallaxFactor, useParallax } from "@codedazur/react-parallax";
import { faker } from "@faker-js/faker";
import { Meta, Story } from "@storybook/react";
import { ReactNode } from "react";
import docs from "./useParallax.docs.mdx";
import layerOne from "./diorama/layer-one.png";
import layerTwo from "./diorama/layer-two.png";
import layerThree from "./diorama/layer-three.png";
import layerFour from "./diorama/layer-four.png";
import layerFive from "./diorama/layer-five.png";
import layerSix from "./diorama/layer-six.png";

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

export const Default: Story = () => (
  <>
    <Placeholder>
      <Row gap="1rem">
        {[-0.5, 0, 0.5, 1, 1.5].map((factor, index) => (
          <Parallax key={index} factor={factor}>
            <Placeholder width="10rem" height="10rem">
              <Text>{factor}</Text>
            </Placeholder>
          </Parallax>
        ))}
      </Row>
    </Placeholder>
    <SizedBox width="200vw" height="200vh" />
  </>
);

const Parallax = ({
  factor,
  children,
}: {
  factor: ParallaxFactor;
  children?: ReactNode;
}) => {
  const { x, y } = useParallax({ factor });

  return (
    <Transform x={x} y={y}>
      {children}
    </Transform>
  );
};

export const Hero: Story = () => (
  <>
    <Center>
      <Stack>
        <Parallax factor={0.5}>
          <Placeholder height="40rem" crossed />
        </Parallax>
        <Center>
          <Text>{faker.commerce.productName()}</Text>
        </Center>
      </Stack>
    </Center>
    <SizedBox height="200vh" />
  </>
);

export const Diorama: Story = () => (
  <>
    <Center>
      <Stack>
        <Parallax factor={0.7}>
          <Image src={layerOne} alt="" />
        </Parallax>
        <Parallax factor={0.75}>
          <Image src={layerTwo} alt="" />
        </Parallax>
        <Parallax factor={0.85}>
          <Image src={layerThree} alt="" />
        </Parallax>
        <Parallax factor={0.95}>
          <Image src={layerFour} alt="" />
        </Parallax>
        <Parallax factor={1}>
          <Image src={layerFive} alt="" />
        </Parallax>
        <Parallax factor={1}>
          <Image src={layerSix} alt="" />
        </Parallax>
      </Stack>
    </Center>
    <SizedBox height="200vh" />
  </>
);

export const NonLinear: Story = () => (
  <>
    <Placeholder>
      <Parallax
        factor={({ x, y }) =>
          new Vector2(5 * Math.sqrt(x), 0.005 * Math.pow(y, 2))
        }
      >
        <Placeholder width="10rem" height="10rem">
          <Text style={{ fontFamily: "system-ui" }}>5⋅√x</Text>
          <Text style={{ fontFamily: "system-ui" }}>0.005⋅y²</Text>
        </Placeholder>
      </Parallax>
    </Placeholder>
    <SizedBox width="200vw" height="100vh" />
  </>
);

export const Dynamic: Story = () => (
  <>
    <Placeholder>
      <Parallax
        factor={({ x, y }) =>
          new Vector2(0, y < 200 ? y : y > 400 ? y - 200 : 200)
        }
      >
        <Placeholder width="10rem" height="10rem" />
      </Parallax>
    </Placeholder>
    <SizedBox width="200vw" height="100vh" />
  </>
);
