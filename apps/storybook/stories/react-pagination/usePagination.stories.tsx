import {
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  Row,
  Separate,
  SizedBox,
  Text,
  usePagination,
  UsePaginationProps,
  UsePaginationWithCountProps,
  UsePaginationWithItemsProps,
} from "@codedazur/react-components";
import { faker } from "@faker-js/faker";
import { WithCenter } from "../../decorators/WithCenter";
import { meta } from "../../utilities/meta";
import { story } from "../../utilities/story";
import docs from "./usePagination.docs.mdx";

export default meta<UsePaginationProps<string>>({
  parameters: {
    docs: {
      page: docs,
    },
  },
  decorators: [WithCenter],
  argTypes: {
    initialPage: { control: { type: "number" } },
    siblings: { control: { type: "number" } },
    boundary: { control: { type: "number" } },
    gapSize: { control: { type: "number" } },
  },
  args: {
    siblings: 1,
    boundary: 1,
    gapSize: 1,
  },
});

export const Default = story<UsePaginationWithCountProps>(
  (args) => {
    const { count, page, setPage, next, previous, range } = usePagination(args);

    return (
      <>
        <Row>
          <PageButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </PageButton>
          <Row>
            <Separate separator={<PageButton disabled>…</PageButton>}>
              {range.map((segment, index) => (
                <Row key={index}>
                  {segment.map((number) => (
                    <PageButton
                      key={number}
                      onClick={() => setPage(number)}
                      disabled={number === page}
                    >
                      {number}
                    </PageButton>
                  ))}
                </Row>
              ))}
            </Separate>
          </Row>
          <PageButton onClick={next} disabled={page === count}>
            <ChevronRightIcon />
          </PageButton>
        </Row>
        {/* <DebugOverlay value={{ count, page, range }} /> */}
      </>
    );
  },
  {
    argTypes: { count: { control: { type: "number" } } },
    args: { count: 9, initialPage: 5 },
  }
);

export const WithSiblingsAndBoundaries = story<UsePaginationWithCountProps>(
  (args) => {
    const { count, page, setPage, next, previous, range } = usePagination(args);

    return (
      <>
        <Row>
          <PageButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </PageButton>
          <Row>
            <Separate separator={<PageButton disabled>…</PageButton>}>
              {range.map((segment, index) => (
                <Row key={index}>
                  {segment.map((number) => (
                    <PageButton
                      key={number}
                      onClick={() => setPage(number)}
                      disabled={number === page}
                    >
                      {number}
                    </PageButton>
                  ))}
                </Row>
              ))}
            </Separate>
          </Row>
          <PageButton onClick={next} disabled={page === count}>
            <ChevronRightIcon />
          </PageButton>
        </Row>
        {/* <DebugOverlay value={{ count, page, range }} /> */}
      </>
    );
  },
  {
    argTypes: {
      count: { control: { type: "number" } },
    },
    args: {
      count: 23,
      initialPage: 12,
      siblings: 3,
      boundary: 2,
    },
  }
);

export const WithItems = story<UsePaginationWithItemsProps<string>>(
  (args) => {
    const { count, page, setPage, next, previous, range, items } =
      usePagination(args);

    return (
      <>
        {items.map((item) => (
          <Text key={item}>{item}</Text>
        ))}
        <SizedBox height="3rem" />
        <Row>
          <PageButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </PageButton>
          <Row>
            <Separate separator={<PageButton disabled>…</PageButton>}>
              {range.map((segment, index) => (
                <Row key={index}>
                  {segment.map((number) => (
                    <PageButton
                      key={number}
                      onClick={() => setPage(number)}
                      disabled={number === page}
                    >
                      {number}
                    </PageButton>
                  ))}
                </Row>
              ))}
            </Separate>
          </Row>
          <PageButton onClick={next} disabled={page === count}>
            <ChevronRightIcon />
          </PageButton>
        </Row>
        {/* <DebugOverlay value={{ count, page, items, range }} /> */}
      </>
    );
  },
  {
    argTypes: {
      items: { control: { type: "object" } },
      itemsPerPage: { control: { type: "number" } },
    },
    args: {
      items: Array.from({ length: 25 }).map(() => faker.commerce.productName()),
      itemsPerPage: 3,
      initialPage: 3,
    },
  }
);

export const WithoutRange = story<UsePaginationWithCountProps>(
  (args) => {
    const { count, page, next, previous } = usePagination(args);

    return (
      <>
        <Row gap="1rem" crossAxisAlignment="center">
          <PageButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </PageButton>
          <Text>
            {page} of {count}
          </Text>
          <PageButton onClick={next} disabled={page === count}>
            <ChevronRightIcon />
          </PageButton>
        </Row>
        {/* <DebugOverlay value={{ count, page }} /> */}
      </>
    );
  },
  {
    argTypes: { count: { control: { type: "number" } } },
    args: { count: 5, initialPage: 1 },
  }
);

export const WithoutSeparator = story<UsePaginationWithCountProps>(
  (args) => {
    const { count, page, setPage, next, previous, range } = usePagination(args);

    return (
      <>
        <Row>
          <PageButton onClick={previous} disabled={page === 1}>
            <ChevronLeftIcon />
          </PageButton>
          <Row>
            {range.map((segment, index) => (
              <Row key={index}>
                {segment.map((number) => (
                  <PageButton
                    key={number}
                    onClick={() => setPage(number)}
                    disabled={number === page}
                  >
                    {number}
                  </PageButton>
                ))}
              </Row>
            ))}
          </Row>
          <PageButton onClick={next} disabled={page === count}>
            <ChevronRightIcon />
          </PageButton>
        </Row>
        {/* <DebugOverlay value={{ count, page, range }} /> */}
      </>
    );
  },
  {
    argTypes: { count: { control: { type: "number" } } },
    args: {
      count: 9,
      initialPage: 5,
      siblings: 2,
      boundary: 0,
      gapSize: 0,
    },
  }
);

const PageButton = Button;

// const PageButton = styled(DebugButton).attrs((props) => ({
//   background: "background",
//   foreground: "foreground",
//   ...props,
// }))`
//   width: 2rem;
//   height: 2rem;
//   padding: 0.125rem;
// `;
