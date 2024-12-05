import { extendTheme } from "@chakra-ui/react";

const colors = {
  coffee: {
    50: "#f7f3f0",
    100: "#ebe1d7",
    200: "#d9c3ae",
    300: "#c6a585",
    400: "#b3875c",
    500: "#7C5026", // your main coffee color
    600: "#DFC298",
    700: "#473C33",
    800: "#6B6C70",
    900: "#19100d",
  },
  milk: {
    50: "#ffffff",
    100: "#fefdfb",
    200: "#fdfbf7",
    300: "#fcf9f3",
    400: "#fbf8ef",
    500: "#FBF8EE", // your main milk color
    600: "#c9c6be",
    700: "#97958f",
    800: "#64635f",
    900: "#323230",
  },
};

const theme = extendTheme({
  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Poppins', sans-serif`,
  },
  colors,
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: {
          bg: "coffee.500",
          color: "milk.500",
          _hover: {
            bg: "coffee.600",
          },
        },
        outline: {
          borderColor: "coffee.500",
          color: "coffee.500",
          _hover: {
            bg: "coffee.50",
          },
        },
      },
      defaultProps: {
        variant: "solid",
      },
    },
    Link: {
      baseStyle: {
        color: "coffee.500",
        _hover: {
          textDecoration: "none",
          color: "coffee.600",
        },
      },
    },
  },
});

export default theme;
