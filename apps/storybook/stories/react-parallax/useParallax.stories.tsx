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

export default {
  title: "Hooks/useParallax",
} as Meta;

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

const title = faker.commerce.productName();

export const Hero: Story = () => (
  <>
    <Stack>
      <Parallax factor={0.5}>
        <Placeholder height="40rem" crossed />
      </Parallax>
      <Center>
        <Text>{title}</Text>
      </Center>
    </Stack>
    <SizedBox height="200vh" />
  </>
);

export const Diorama: Story = () => (
  <>
    <Center>
      <Stack>
        <Parallax factor={0.7}>
          <Image source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/c3po-base-test.png" />
        </Parallax>
        <Parallax factor={0.75}>
          <Image source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/c3po--base-1_copy.png" />
        </Parallax>
        <Parallax factor={0.85}>
          <Image source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/c3po-foreground-test_copy.png" />
        </Parallax>
        <Parallax factor={0.95}>
          <Image source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/title_copy.png" />
        </Parallax>
        <Parallax factor={1}>
          <Image source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/c3po-profile_copy_copy.png" />
        </Parallax>
        <Parallax factor={1}>
          <Image source="https://s3-us-west-2.amazonaws.com/s.cdpn.io/36124/c3po-eyes_copy.png" />
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
          new Vector2(10 * Math.sqrt(x), 0.0001 * Math.pow(y, 2))
        }
      >
        <Placeholder width="10rem" height="10rem">
          <Text style={{ fontFamily: "system-ui" }}>10⋅√x</Text>
          <Text style={{ fontFamily: "system-ui" }}>0.001⋅y²</Text>
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
