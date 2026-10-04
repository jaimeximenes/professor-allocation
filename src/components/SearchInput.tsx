import { Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { Search } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  return (
    <InputGroup maxW={{ md: "xs" }}>
      <InputLeftElement pointerEvents="none" color="fg.muted">
        <Icon as={Search} boxSize="4" />
      </InputLeftElement>
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        bg="bg.surface"
      />
    </InputGroup>
  );
}
