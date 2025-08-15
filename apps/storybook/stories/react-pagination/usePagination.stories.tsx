import {
  Box,
  Column,
  Icon,
  IconButton,
  Row,
  Separate,
  SymbolButton,
  Text,
} from "@codedazur/fusion-ui";
import {
  UsePaginationProps,
  UsePaginationWithItemsProps,
  UsePaginationWithPagesProps,
  usePagination,
} from "@codedazur/react-pagination";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react-vite";
import { DebugOverlay } from "../../components/DebugOverlay";

const meta: Meta<UsePaginationProps<string>> = {
  title: "React/Pagination/usePagination",
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
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronLeft}
            onClick={previous}
            disabled={page === 1}
          />
          <Row>
            <Separate
              separator={
                <SymbolButton variant="tertiary" disabled>
                  …
                </SymbolButton>
              }
            >
              {range.map((segment, index) => (
                <Row key={index}>
                  {segment.map((number) => (
                    <SymbolButton
                      variant="tertiary"
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
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronRight}
            onClick={next}
            disabled={page === pages}
          />
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
            <IconButton
              variant="tertiary"
              icon={Icon.ChevronLeft}
              onClick={previous}
              disabled={page === 1}
            />
            <Row>
              <Separate
                separator={
                  <SymbolButton variant="tertiary" disabled>
                    …
                  </SymbolButton>
                }
              >
                {range.map((segment, index) => (
                  <Row key={index}>
                    {segment.map((number) => (
                      <SymbolButton
                        variant="tertiary"
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
            <IconButton
              variant="tertiary"
              icon={Icon.ChevronRight}
              onClick={next}
              disabled={page === pages}
            />
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
        <Column align="center" gap={400}>
          {items.map((item) => (
            <Text key={item} font={5}>
              {item}
            </Text>
          ))}
        </Column>
        <Box size={{ height: 300 }} />
        <Row>
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronLeft}
            onClick={previous}
            disabled={page === 1}
          />
          <Row>
            <Separate
              separator={
                <SymbolButton variant="tertiary" disabled>
                  …
                </SymbolButton>
              }
            >
              {range.map((segment, index) => (
                <Row key={index}>
                  {segment.map((number) => (
                    <SymbolButton
                      variant="tertiary"
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
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronRight}
            onClick={next}
            disabled={page === pages}
          />
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
        <Row gap={400} align="center">
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronLeft}
            onClick={previous}
            disabled={page === 1}
          />
          <Text font={5}>
            {page} of {pages}
          </Text>
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronRight}
            onClick={next}
            disabled={page === pages}
          />
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
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronLeft}
            onClick={previous}
            disabled={page === 1}
          />
          <Row>
            {range.map((segment, index) => (
              <Row key={index}>
                {segment.map((number) => (
                  <SymbolButton
                    variant="tertiary"
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
          <IconButton
            variant="tertiary"
            icon={Icon.ChevronRight}
            onClick={next}
            disabled={page === pages}
          />
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
