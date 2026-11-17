import { Card, Menu, Paper, createTheme } from "@mantine/core";
import classes from "./theme.module.scss";

// Component defaults instead of repeating `bg="dark.7"` and the same border on every panel.
// A component can still override them with its own `style` or `styles`.
export const theme = createTheme({
  primaryColor: "blue",
  components: {
    Paper: Paper.extend({ classNames: { root: classes.surface } }),
    Card: Card.extend({ classNames: { root: classes.surface } }),
    Menu: Menu.extend({ classNames: { dropdown: classes.surface } }),
  },
});
