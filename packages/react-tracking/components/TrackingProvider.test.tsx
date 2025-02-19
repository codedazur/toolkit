import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TrackingProvider } from '../components/TrackingProvider';
import { useTracker } from '../hooks/useTracker';


// Mock component to test tracking functionality
const TestComponent = () => {
  const { trackClick } = useTracker();
  return <button onClick={(e) => trackClick(e)}>Test Button</button>;
};

describe('TrackingProvider', () => {
  it('should track events without metadata when not provided', async () => {
    const mockTracker = vi.fn();
    
    const { getByText } = render(
      <TrackingProvider tracker={mockTracker}>
        <TestComponent />
      </TrackingProvider>
    );

    fireEvent.click(getByText('Test Button'));

    expect(mockTracker).toHaveBeenCalledTimes(1);
    const trackedEvent = mockTracker.mock.calls[0][0];
    
    expect(trackedEvent).toMatchObject({
      type: 'click',
      data: {
        page: expect.any(Object),
        element: expect.any(Object),
      }
    });
    
    // Ensure metadata is not present
    expect(trackedEvent.data).not.toHaveProperty('metadata');
  });

  it('should include metadata in tracked events when provided', async () => {
    const mockTracker = vi.fn();
    const testMetadata = { id: "TestId", title: "Test Title" };
    
    const { getByText } = render(
      <TrackingProvider tracker={mockTracker} metadata={testMetadata}>
        <TestComponent />
      </TrackingProvider>
    );

    fireEvent.click(getByText('Test Button'));

    expect(mockTracker).toHaveBeenCalledTimes(1);
    const trackedEvent = mockTracker.mock.calls[0][0];
    
    expect(trackedEvent).toMatchObject({
      type: 'click',
      data: {
        page: expect.any(Object),
        element: expect.any(Object),
        metadata: testMetadata
      }
    });
  });

  it('should inherit tracker from parent provider', async () => {
    const parentTracker = vi.fn();
    const childTracker = vi.fn();
    
    const { getByText } = render(
      <TrackingProvider tracker={parentTracker}>
        <TrackingProvider>
          <TestComponent />
        </TrackingProvider>
      </TrackingProvider>
    );

    fireEvent.click(getByText('Test Button'));

    expect(parentTracker).toHaveBeenCalledTimes(1);
    expect(childTracker).not.toHaveBeenCalled();
  });

  it('should combine path segments correctly', async () => {
    const mockTracker = vi.fn();
    
    const { getByText } = render(
      <TrackingProvider tracker={mockTracker} slug="parent">
        <TrackingProvider slug="child">
          <TestComponent />
        </TrackingProvider>
      </TrackingProvider>
    );

    fireEvent.click(getByText('Test Button'));

    const trackedEvent = mockTracker.mock.calls[0][0];
    expect(trackedEvent.path).toBe('parent.child');
  });

  it('should inherit and merge metadata from parent provider', async () => {
    const mockTracker = vi.fn();
    const parentMetadata = { parentId: "ParentId", shared: "Parent" };
    const childMetadata = { childId: "ChildId", shared: "Child" };
    
    const { getByText } = render(
      <TrackingProvider tracker={mockTracker} metadata={parentMetadata}>
        <TrackingProvider metadata={childMetadata}>
          <TestComponent />
        </TrackingProvider>
      </TrackingProvider>
    );

    fireEvent.click(getByText('Test Button'));

    expect(mockTracker).toHaveBeenCalledTimes(1);
    const trackedEvent = mockTracker.mock.calls[0][0];
    
    expect(trackedEvent).toMatchObject({
      type: 'click',
      data: {
        page: expect.any(Object),
        element: expect.any(Object),
        metadata: {
          ...parentMetadata,
          ...childMetadata 
        }
      }
    });

    expect(trackedEvent.data.metadata).toEqual({
      parentId: "ParentId",
      childId: "ChildId",
      shared: "Child" 
    });
  });
});
