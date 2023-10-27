import { Center, ConstrainedBox } from "@codedazur/react-components";
import { Logo } from "@apps/website/components/Logo";
import { useMedia } from "@codedazur/react-media";
import { resolveMaybeRef } from "@codedazur/react-essentials";
import { useEffect, useRef } from "react";

export default function Home() {
  const { setVolume } = useMedia();
  setVolume(0.5);
  const elementRef = useRef(null);
  const element = resolveMaybeRef(elementRef);
  useEffect(() => {
    console.log(element);
  }, [element]);

  return (
    <Center>
      <ConstrainedBox ref={elementRef} width="50%" maxWidth="20rem">
        <Logo />
      </ConstrainedBox>
    </Center>
  );
}
