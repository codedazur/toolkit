import { ButtonGroup, Card, Center, LinkButton } from "@codedazur/fusion-ui";
import { Logo } from "ui";

interface WelcomeCardProps {
  title: string;
  body: string;
}

export function WelcomeCard({ title, body }: WelcomeCardProps) {
  return (
    <Card
      constraints={{ maxWidth: 850 }}
      media={
        <Center
          padding={1000}
          background={{ color: "primary.base" }}
          text={{ color: "primary.onBase" }}
        >
          <Logo />
        </Center>
      }
      info={{
        title,
        body,
        actions: (
          <ButtonGroup>
            <LinkButton href="https://docs.fusion.codedazur.cloud">
              Documentation
            </LinkButton>
          </ButtonGroup>
        ),
      }}
    />
  );
}
