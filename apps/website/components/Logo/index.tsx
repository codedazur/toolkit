import { Image } from "@codedazur/react-components";
import { FunctionComponent } from "react";
import logo from "./logo.svg";

export const Logo: FunctionComponent = () => (
  <Image src={logo} alt="code d'azur" />
);
