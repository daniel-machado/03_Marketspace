import { Input as NativeBaseInput, IInputProps, FormControl } from 'native-base'

type Props = IInputProps & {
  errorMessage?: string | null;
}
export function TextInput({ errorMessage = null, isInvalid, ...rest }: Props) {
  const invalid = !!errorMessage || isInvalid;

  return (
    <FormControl isInvalid={invalid} mb={4}>
      <NativeBaseInput 
        bg="gray.100"
        h={12}
        px={4}
        rounded="lg"
        color="gray.600"
        borderWidth={0}
        fontSize="md"
        fontFamily="body"
        placeholderTextColor="gray.400"
        isInvalid={invalid}
        _invalid={{
          borderWidth: 2,
          borderColor: "red.500",
        }}
        _focus={{
          bg: "gray.100",
          borderWidth: 2,
          borderColor: "blue.500",
        }}

        {...rest}
      />

      <FormControl.ErrorMessage _text={{ color: "red.500" }}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}

{/*

export function Input({ errorMessage = null, isInvalid, ...rest }: Props){
  const invalid = !!errorMessage || isInvalid;
  
  return (
    <FormControl isInvalid={invalid} mb={4}>
      <NativeBaseInput
        bg="gray.700"
        h={12}
        px={4}
        borderWidth={0}
        borderRadius={7}
        fontSize="md"
        color="gray.400"
        fontFamily="body"
        placeholderTextColor="gray.400"
        isInvalid={invalid}
        _invalid={{
          borderWidth: 2,
          borderColor: "red.500"
        }}
        _focus={{
          bg: "gray.700",
          borderWidth: 2,
          borderColor: "blue.500"
        }}
        {...rest}
      />
      <FormControl.ErrorMessage>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  )
}
*/}