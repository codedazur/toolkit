import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Column,
  Text,
} from "@codedazur/fusion-ui";
import { _icons } from "@codedazur/fusion-ui/components/Icon/icons";
import { faker } from "@faker-js/faker";
import { maybe } from "./maybe";

type MaybeRange = number | { min: number; max: number };

export const random = {
  boolean: (chance: number = 0.5) => Math.random() < chance,
  name: faker.person.fullName,
  jobTitle: faker.person.jobTitle,
  title: faker.commerce.productName,
  word: faker.commerce.product,
  sentence: (words: MaybeRange = { min: 5, max: 10 }) =>
    faker.lorem.sentence(words),
  paragraph: (sentences: MaybeRange = { min: 3, max: 5 }) =>
    faker.lorem.paragraph(sentences),
  paragraphs: (count: MaybeRange = 3) => (
    <Column gap={300}>
      {random.array(
        (index) => (
          <Text key={index}>{random.paragraph()}</Text>
        ),
        count,
      )}
    </Column>
  ),
  button: () => (
    <Button
      variant={random.entry(["primary", "secondary"])}
      trailing={maybe(random.icon())}
    >
      {random.word()}
    </Button>
  ),
  buttons: (
    count: MaybeRange = { min: 1, max: 3 },
    props?: ButtonGroupProps<HTMLDivElement>,
  ) => (
    <ButtonGroup {...props}>
      {random.array(
        (index) => (
          <Text key={index}>{random.button()}</Text>
        ),
        count,
      )}
    </ButtonGroup>
  ),
  image: (options?: Parameters<typeof faker.image.urlPicsumPhotos>[0]) =>
    faker.image.urlPicsumPhotos({
      width: 2560,
      height: 1440,
      ...options,
    }),
  avatar: faker.image.avatar,
  entry: function randomEntry<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },
  array: function array<T>(
    callback: (index: number, length: number) => T,
    range: MaybeRange = { min: 2, max: 5 },
  ): T[] {
    const length = typeof range === "number" ? range : random.number(range);

    return Array.from({ length }, (_, index) => callback(index, length));
  },
  Icon: () => random.entry(Object.values(_icons)),
  icon: () => {
    const Icon = random.Icon();
    return <Icon />;
  },
  number: function randomNumber({
    min = 0,
    max = 100,
    step = 1,
  }: {
    min?: number;
    max?: number;
    step?: number;
  }): number {
    return Math.floor(Math.random() * (max - min + step) + min);
  },
};
