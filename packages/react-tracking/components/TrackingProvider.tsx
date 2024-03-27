"use client";

import {
  MouseEvent,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  AnchorElementData,
  BaseElementData,
  BaseEvent,
  ElementData,
  ElementEvent,
  EventMetadata,
  FrameElementData,
  ImageElementData,
  MediaElementData,
  PageData,
  PageEvent,
  TrackingEventType,
  trackingContext,
} from "../contexts/trackingContext";

export interface TrackingProviderProps {
  slug: string;
  tracker?: Tracker | Promise<Tracker> | false;
  children?: ReactNode;
}

export type Tracker = (event: BaseEvent & EventMetadata) => Promise<void>;

export function TrackingProvider({
  slug,
  tracker,
  children,
}: TrackingProviderProps) {
  const parent = usePrivateTracker();

  const inheritedTracker = useMemo(
    () => (tracker === undefined ? parent.tracker : tracker),
    [parent.tracker, tracker],
  );

  const path = useMemo(() => [...parent.path, slug], [parent.path, slug]);

  const track = useCallback(
    async function track<E extends BaseEvent>(event: E) {
      let resolvedTracker =
        inheritedTracker instanceof Promise
          ? await inheritedTracker
          : inheritedTracker;

      if (resolvedTracker instanceof Function) {
        return resolvedTracker({
          timestamp: new Date().getTime(),
          path: path.join("."),
          ...event,
        });
      }
    },
    [inheritedTracker, path],
  );

  const trackElement = useCallback(
    (type: string, element: HTMLElement) => {
      return track<ElementEvent>({
        type,
        data: {
          page: getDataForPage(),
          element: getDataForElement(element),
        },
      });
    },
    [track],
  );

  const trackEvent = useCallback(
    (type: string, event: SyntheticEvent<HTMLElement>) => {
      return trackElement(type, event.currentTarget as HTMLElement);
    },
    [trackElement],
  );

  const trackNavigate = useCallback(
    (data: Partial<PageData>) => {
      return track<PageEvent>({
        type: TrackingEventType.navigate,
        data: {
          page: { ...getDataForPage(), ...data },
        },
      });
    },
    [track],
  );

  const trackClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      return trackEvent(TrackingEventType.click, event);
    },
    [trackEvent],
  );

  const trackEnter = useCallback(
    (element: HTMLElement) => {
      return trackElement(TrackingEventType.enter, element);
    },
    [trackElement],
  );

  const trackExit = useCallback(
    (element: HTMLElement) => {
      return trackElement(TrackingEventType.exit, element);
    },
    [trackElement],
  );

  const trackLoad = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      return trackEvent(TrackingEventType.load, event);
    },
    [trackEvent],
  );

  return (
    <trackingContext.Provider
      value={{
        tracker: inheritedTracker,
        path,
        track,
        trackElement,
        trackEvent,
        trackNavigate,
        trackClick,
        trackEnter,
        trackExit,
        trackLoad,
      }}
    >
      {children}
    </trackingContext.Provider>
  );
}

const usePrivateTracker = () => useContext(trackingContext);

function getDataForPage(): PageData {
  return {
    host: window.location.hostname,
    path: window.location.pathname,
    title: window.document.title,
  };
}

function getDataForElement(element: HTMLElement): ElementData {
  if (element instanceof HTMLAnchorElement) {
    return anchorElementData(element);
  } else if (element instanceof HTMLImageElement) {
    return imageElementData(element);
  } else if (element instanceof HTMLMediaElement) {
    return mediaElementData(element);
  } else if (element instanceof HTMLIFrameElement) {
    return frameElementData(element);
  } else {
    return elementData(element);
  }
}

function elementData(element: HTMLElement): BaseElementData {
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || null,
    /**
     * @todo Decide whether the cost of calculating the `cssPath` is worth the
     * business value. Maybe the `context` is good enough.
     */
    path: cssPath(element),
    label: element.title || element.ariaLabel || null,
    text: element.textContent || null,
  };
}

function anchorElementData(element: HTMLAnchorElement): AnchorElementData {
  return {
    ...elementData(element),
    anchor: {
      destination: element.href,
    },
  };
}

function imageElementData(element: HTMLImageElement): ImageElementData {
  return {
    ...elementData(element),
    image: {
      source: element.srcset || element.src,
      description: element.alt,
    },
  };
}

function mediaElementData(element: HTMLMediaElement): MediaElementData {
  return {
    ...elementData(element),
    media: {
      source: element.currentSrc,
      duration: element.duration,
      time: element.currentTime,
      progress: element.currentTime / element.duration,
    },
  };
}

function frameElementData(element: HTMLIFrameElement): FrameElementData {
  return {
    ...elementData(element),
    frame: {
      source: element.src,
    },
  };
}

/**
 * @todo Move this to a utility directory or consider exporting this as part of
 * the `@codedazur/essentials` package.
 * @todo Write unit tests for this function.
 * @todo Determine the performance cost of this function.
 */
function cssPath(element: HTMLElement) {
  const path = [];

  let node: Node | null = element;

  while (node instanceof Element) {
    let selector = node.nodeName.toLowerCase();

    if (node.id) {
      selector += "#" + node.id;
      path.unshift(selector);
      break;
    } else {
      let sibling: Element | null = node;
      let n = 1;

      while ((sibling = sibling.previousElementSibling)) {
        if (sibling.nodeName.toLowerCase() == selector) {
          n++;
        }
      }

      if (n != 1) {
        selector += `:nth-of-type(${n})`;
      }
    }

    path.unshift(selector);
    node = node.parentNode;
  }

  return path.join(" > ");
}
