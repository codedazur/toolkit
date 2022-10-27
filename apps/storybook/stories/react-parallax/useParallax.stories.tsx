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
import { useParallax } from "@codedazur/react-parallax";
import { faker } from "@faker-js/faker";
import { Meta, Story } from "@storybook/react";
import { ReactNode } from "react";

export default {
  title: "Hooks/useParallax",
} as Meta;

export const Default: Story = () => (
  <>
    <Center>
      <Row gap="1rem">
        {[-0.5, 0, 0.5, 1, 1.5].map((factor, index) => (
          <Parallax key={index} factor={factor}>
            <Placeholder width="10rem" height="10rem">
              <Text>{factor}</Text>
            </Placeholder>
          </Parallax>
        ))}
      </Row>
    </Center>
    <SizedBox width="200vw" height="200vh" />
  </>
);

const Parallax = ({
  factor,
  children,
}: {
  factor: number;
  children?: ReactNode;
}) => {
  const { translation } = useParallax({ factor });

  return (
    <Transform translateX={translation.x} translateY={translation.y}>
      {children}
    </Transform>
  );
};

const title = faker.commerce.productName();

export const Hero: Story = () => (
  <>
    <Stack>
      <Parallax factor={0.5}>
        <Placeholder height="40rem" shape="square" crossed />
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
