import {
  AspectRatio,
  Center,
  ConstrainedBox,
  Page,
} from "@codedazur/react-components";
import { Logo } from "@apps/website/components/Logo";

export default function Home() {
  return (
    <Center>
      <ConstrainedBox width="50%" maxWidth="20rem">
        <Logo />
      </ConstrainedBox>
    </Center>
  );
}
