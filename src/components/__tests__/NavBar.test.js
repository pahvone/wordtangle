import { render, screen } from "../../test-utils";
import { render as defaultRender } from "@testing-library/react";
import { screen as defaultScreen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import user from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import Navbar from "../NavBar";

describe("navbar", () => {
  describe("logo", () => {
    test("renders correctly", () => {
      render(<Navbar />);
      const imageElement = screen.getByAltText(/word tangle logo/i);
      expect(imageElement).toBeInTheDocument();
    });
  });
  describe("dashboard link", () => {
    test("renders correctly", () => {
      render(<Navbar />);
      const textElement = screen.getByTestId("dashboard-main");
      expect(textElement).toBeInTheDocument();
    });
    // test('routes correctly', () => {
    //     const history = createMemoryHistory();
    //     user.setup()
    //     history.push = jest.fn();

    //     defaultRender(<MemoryRouter history={history}><Navbar/></MemoryRouter>)
    //     const linkElement = screen.getByText(/dashboard/i)
    //     user.click(linkElement)
    //     expect(history.push).toHaveBeenCalledWith('/Dashboard')
    // })
  });
  describe("learn link", () => {
    test("main renders correctly", () => {
      render(<Navbar />);
      const textElement = screen.getByTestId("learn-main");
      expect(textElement).toBeInTheDocument();
    });
    test("check hamburger menu exists too", () => {
      render(<Navbar />);
      const listOfElements = screen.getAllByText(/learn/i);
      expect(listOfElements).toHaveLength(2);
    });
  });
  describe("forums link", () => {
    test("main renders correctly", () => {
      render(<Navbar />);
      const textElement = screen.getByTestId("forums-main");
      expect(textElement).toBeInTheDocument();
    });
    test("check hamburger menu exists too", () => {
      render(<Navbar />);
      const listOfElements = screen.getAllByText(/forums/i);
      expect(listOfElements).toHaveLength(2);
    });
  });
  describe("settings link", () => {
    test("main renders correctly", () => {
      render(<Navbar />);
      const textElement = screen.getByTestId("settings-main");
      expect(textElement).toBeInTheDocument();
    });
    test("check hamburger menu exists too", () => {
      render(<Navbar />);
      const listOfElements = screen.getAllByText(/settings/i);
      expect(listOfElements).toHaveLength(2);
    });
  });
  describe("about link", () => {
    test("main renders correctly", () => {
      render(<Navbar />);
      const textElement = screen.getByTestId("about-main");
      expect(textElement).toBeInTheDocument();
    });
    test("check hamburger menu exists too", () => {
      render(<Navbar />);
      const listOfElements = screen.getAllByText(/about/i);
      expect(listOfElements).toHaveLength(2);
    });
  });
  describe("sign out link", () => {
    test("main renders correctly", () => {
      render(<Navbar />);
      const textElement = screen.getByTestId("signout-main");
      expect(textElement).toBeInTheDocument();
    });
    test("check hamburger menu exists too", () => {
      render(<Navbar />);
      const listOfElements = screen.getAllByText(/sign out/i);
      expect(listOfElements).toHaveLength(2);
    });
  });
});
