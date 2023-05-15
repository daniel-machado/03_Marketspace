import { ReactNode } from 'react'
import {
  Button as ButtonNativeBase,
  IButtonProps,
  Text,
  HStack,
} from 'native-base'

type Props = IButtonProps & {
  title: string
  icon?: ReactNode
}

export const ButtonCreate = ({ title, icon, ...rest }: Props) => {
  return (
    <ButtonNativeBase
      w="full"
      h={14}
      bg="gray.200"
      rounded="md"
      _pressed={{
        bg: 'gray.300',
      }}
      {...rest}
    >
      <HStack alignItems="center">
        {icon}
        <Text
          ml={icon ? 2 : 0}
          color="gray.700"
          fontFamily="heading"
          fontSize="sm"
        >
          {title}
        </Text>
      </HStack>
    </ButtonNativeBase>
  )
}