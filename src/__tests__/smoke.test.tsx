import { render, screen } from  @testing-library/react;
import @testing-library/jest-dom;

const TestComponent = () => <div data-testid=smoke>ELIKSIR ¯YJE</div>;

describe(Smoke Test, () => {
  it(renders without crashing, () => {
    render(<TestComponent />);
    expect(screen.getByTestId(smoke)).toBeInTheDocument();
  });
});
