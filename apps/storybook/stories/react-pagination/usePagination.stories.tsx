import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Column,
  Row,
  Separate,
  SizedBox,
  Text,
} from "@codedazur/react-components";
import {
  UsePaginationProps,
  UsePaginationWithPagesProps,
  UsePaginationWithItemsProps,
  usePagination,
} from "@codedazur/react-pagination";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react";
import { SymbolButton } from "@apps/storybook/components/SymbolButton";
import docs from "./usePagination.docs.mdx";
import { DebugOverlay } from "../../components/DebugOverlay";

const meta: Meta<UsePaginationProps<string>> = {
  title: "React-Pagination/usePagination",
  parameters: {
    docs: {
      page: docs,
    },
  },
  argTypes: {
    initialPage: { control: { type: "number" } },
    siblings: { control: { type: "number" } },
    boundaries: { control: { type: "number" } },
    gapSize: { control: { type: "number" } },
  },
  args: {
    siblings: 1,
    boundaries: 1,
    gapSize: 1,
  },
};
export default meta;

export const Default: StoryObj<UsePaginationWithPagesProps> = {
  render: function Default(args) {
    const { pages, page, setPage, next, previous, range } = usePagination(args);

    return (
      <>
        <Row>
          <SymbolButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </SymbolButton>
          <Row>
            <Separate separator={<SymbolButton disabled>…</SymbolButton>}>
              {range.map((segment, index) => (
                <Row key={index}>
                  {segment.map((number) => (
                    <SymbolButton
                      key={number}
                      onClick={() => setPage(number)}
                      disabled={number === page}
                    >
                      {number}
                    </SymbolButton>
                  ))}
                </Row>
              ))}
            </Separate>
          </Row>
          <SymbolButton onClick={next} disabled={page === pages}>
            <ChevronRightIcon />
          </SymbolButton>
        </Row>
        <DebugOverlay value={{ pages, page, range }} />
      </>
    );
  },
  argTypes: { pages: { control: { type: "number" } } },
  args: { pages: 9, initialPage: 5 },
};

export const WithSiblingsAndBoundaries: StoryObj<UsePaginationWithPagesProps> =
  {
    render: function WithSiblingsAndBoundariesStory(args) {
      const { pages, page, setPage, next, previous, range } =
        usePagination(args);

      return (
        <>
          <Row>
            <SymbolButton onClick={previous} disabled={page === 1}>
              <ChevronLeftIcon />
            </SymbolButton>
            <Row>
              <Separate separator={<SymbolButton disabled>…</SymbolButton>}>
                {range.map((segment, index) => (
                  <Row key={index}>
                    {segment.map((number) => (
                      <SymbolButton
                        key={number}
                        onClick={() => setPage(number)}
                        disabled={number === page}
                      >
                        {number}
                      </SymbolButton>
                    ))}
                  </Row>
                ))}
              </Separate>
            </Row>
            <SymbolButton onClick={next} disabled={page === pages}>
              <ChevronRightIcon />
            </SymbolButton>
          </Row>
          <DebugOverlay value={{ pages, page, range }} />
        </>
      );
    },
    argTypes: {
      pages: { control: { type: "number" } },
    },
    args: {
      pages: 23,
      initialPage: 12,
      siblings: 3,
      boundaries: 2,
    },
  };

export const WithItems: StoryObj<UsePaginationWithItemsProps<string>> = {
  render: function WithItems(args) {
    const { pages, page, setPage, next, previous, range, items } =
      usePagination(args);

    return (
      <>
        <Column align="center">
          {items.map((item) => (
            <Text key={item}>{item}</Text>
          ))}
        </Column>
        <SizedBox height="3rem" />
        <Row>
          <SymbolButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </SymbolButton>
          <Row>
            <Separate separator={<SymbolButton disabled>…</SymbolButton>}>
              {range.map((segment, index) => (
                <Row key={index}>
                  {segment.map((number) => (
                    <SymbolButton
                      key={number}
                      onClick={() => setPage(number)}
                      disabled={number === page}
                    >
                      {number}
                    </SymbolButton>
                  ))}
                </Row>
              ))}
            </Separate>
          </Row>
          <SymbolButton onClick={next} disabled={page === pages}>
            <ChevronRightIcon />
          </SymbolButton>
        </Row>
        <DebugOverlay value={{ pages, page, items, range }} />
      </>
    );
  },
  argTypes: {
    items: { control: { type: "object" } },
    itemsPerPage: { control: { type: "number" } },
  },
  args: {
    items: Array.from({ length: 25 }).map(() => faker.commerce.productName()),
    itemsPerPage: 3,
    initialPage: 3,
  },
};

export const WithoutRange: StoryObj<UsePaginationWithPagesProps> = {
  render: function WithoutRange(args) {
    const { pages, page, next, previous } = usePagination(args);

    return (
      <>
        <Row gap="1rem" crossAxisAlignment="center">
          <SymbolButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </SymbolButton>
          <Text>
            {page} of {pages}
          </Text>
          <SymbolButton onClick={next} disabled={page === pages}>
            <ChevronRightIcon />
          </SymbolButton>
        </Row>
        <DebugOverlay value={{ pages, page }} />
      </>
    );
  },
  argTypes: { pages: { control: { type: "number" } } },
  args: { pages: 5, initialPage: 1 },
};

export const WithoutSeparator: StoryObj<UsePaginationWithPagesProps> = {
  render: function WithoutSeparator(args) {
    const { pages, page, setPage, next, previous, range } = usePagination(args);

    return (
      <>
        <Row>
          <SymbolButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </SymbolButton>
          <Row>
            {range.map((segment, index) => (
              <Row key={index}>
                {segment.map((number) => (
                  <SymbolButton
                    key={number}
                    onClick={() => setPage(number)}
                    disabled={number === page}
                  >
                    {number}
                  </SymbolButton>
                ))}
              </Row>
            ))}
          </Row>
          <SymbolButton onClick={next} disabled={page === pages}>
            <ChevronRightIcon />
          </SymbolButton>
        </Row>
        <DebugOverlay value={{ pages, page, range }} />
      </>
    );
  },
  argTypes: { pages: { control: { type: "number" } } },
  args: {
    pages: 9,
    initialPage: 5,
    siblings: 2,
    boundaries: 0,
    gapSize: 0,
  },
};
