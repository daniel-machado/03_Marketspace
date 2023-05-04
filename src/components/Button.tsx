import { Button as ButtonNativeBase, IButtonProps, Text } from 'native-base';

type Props = IButtonProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'terceary';
}

export function Button({ title, variant = 'primary', ...rest }: Props){
  return (
    <ButtonNativeBase
      w="full"
      h={42}
      bg={variant === 'terceary' ? 'gray.100' 
          : variant === 'secondary' ? 'gray.500' 
          : 'blue.700' }
      borderRadius={7}
      _pressed={{
        bg: variant === 'terceary' ? 'gray.300' 
        : variant === 'secondary' ? 'gray.600' 
        : 'blue.500'
      }}
      {...rest}
    >
      <Text
        color={variant === 'terceary' ? 'gray.700' 
        : variant === 'secondary' ? 'gray.100' 
        : 'gray.700' }
        fontFamily="heading"
        fontSize="sm"
      >
        {title}
      </Text>

    </ButtonNativeBase>
  )
}