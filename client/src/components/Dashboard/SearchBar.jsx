import React from "react";
import { Box, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <Box my={4}>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          color="white"
          bg={"coffee.700"}
          rounded={"xl"}
          px={2}
          children={<Search size={20} />}
        />
        <Input
          boxShadow={"md"}
          rounded={"xl"}
          w={"70%"}
          bg={"coffee.200"}
          _placeholder={{ color: "white", fontWeight: "light" }}
          py={5}
          color={"white"}
          placeholder="Search"
        />
      </InputGroup>
    </Box>
  );
};

export default SearchBar;
