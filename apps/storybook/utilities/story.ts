import { StoryAnnotations } from "@storybook/csf";
import { ReactFramework, Story } from "@storybook/react";

export function story<T extends object = Record<string, never>>(
  story: Story<T>,
  annotations: StoryAnnotations<ReactFramework, T> = {}
) {
  const clone = story.bind({});

  if (annotations.args) clone.args = annotations.args;
  if (annotations.argTypes) clone.argTypes = annotations.argTypes;
  if (annotations.decorators) clone.decorators = annotations.decorators;
  if (annotations.loaders) clone.loaders = annotations.loaders;
  if (annotations.name) clone.name = annotations.name;
  if (annotations.parameters) clone.parameters = annotations.parameters;
  if (annotations.play) clone.play = annotations.play;
  if (annotations.render) clone.render = annotations.render;
  if (annotations.story) clone.story = annotations.story;
  if (annotations.storyName) clone.storyName = annotations.storyName;

  return clone;
}
