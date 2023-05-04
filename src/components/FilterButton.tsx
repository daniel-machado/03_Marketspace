import { Button, IButtonProps, Icon, Text } from 'native-base'
import { AntDesign } from '@expo/vector-icons'

interface FilterButtonProps extends IButtonProps {
  title: string
  selected: boolean
}

export function FilterButton({ title, selected ,...rest }: FilterButtonProps) {
  return(
    <Button
      backgroundColor={selected ? 'blue.500' : 'gray.500'}
      mr={2}
      px={selected ? 2 : 4}
      py={1.5}
      rounded='2xl'
      mt={3}
      rightIcon={ selected ?
        <Icon 
          as={AntDesign}
          name='closecircle'
          size={4}
          pr='0'
        />
        :
        <></>
      }
      {...rest}
    >
      <Text
        fontFamily='heading'
        color={selected ? 'gray.700' : 'gray.300'}
      >
        { title }
      </Text>
    </Button>
  )
}
